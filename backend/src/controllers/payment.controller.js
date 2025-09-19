// controllers/paymentController.js

import  {asyncHandler} from '../utils/asyncHandler.js';
import  {ApiError} from '../utils/ApiError.js';
import  {ApiResponse} from '../utils/ApiResponse.js';
import  {Order} from '../models/orders.model.js'; // Use the import updated Order model
import  {User} from '../models/user.model.js';
import  {Cart} from '../models/cart.model.js';
import  {Inventory} from '../models/inventory.model.js';
import  {Transaction} from '../models/transaction.model.js'; // import Use the new Transaction model
import  { calculateItemPrice } from '../utils/discountCalculations.js'; // Assuming this helper
 
import PaytmChecksum from 'paytmchecksum';
import  https from 'https';
import { StandardCheckoutClient, Env, MetaInfo, StandardCheckoutPayRequest } from 'pg-sdk-node';

// PhonePe Configuration (for Payouts/Withdrawals)
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const PAY_API_URL = process.env.PHONEPE_PAY_URL;
const REDIRECT_URL = process.env.FRONTEND_REDIRECT_URL;


// --- Controller to create an Order and get transaction token for Paytm PG ---
const createOrderAndInitiatePaytm = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { shippingInfo, cartId } = req.body; // Expect shippingInfo and cartId from frontend
    
        if (!shippingInfo || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.pinCode || !shippingInfo.phoneNo) {
            throw new ApiError(400, "Please provide complete shipping information.");
        }
        if (!cartId) {
            throw new ApiError(400, "Cart ID is required to create an order.");
        }

        const contactNumber = req.user.contactNumber || shippingInfo.phoneNo;
        if (!contactNumber) {
            throw new ApiError(400, "Contact Number is missing.");
        }
    
        // 1. Fetch user's cart
        const cart = await Cart.findById(cartId).populate('products.product');
    
        if (!cart || cart.products.length === 0 || cart.user.toString() !== userId.toString()) {
            throw new ApiError(400, "Your cart is empty or invalid. Cannot create an order.");
        }
    
        // 2. Calculate total amount and prepare products for order, checking inventory
        let totalAmount = 0;
        const orderProducts = [];
    
        for (const item of cart.products) {
            if (!item.product) {
                throw new ApiError(500, "Product not found for an item in cart.");
            }
            // Check inventory stock
            const inventory = await Inventory.findOne({ productId: item.product._id });
            if (!inventory || inventory.stock < item.quantity) {
                throw new ApiError(409, `Insufficient stock for ${item.product.name}. Available: ${inventory ? inventory.stock : 0}, Requested: ${item.quantity}.`);
            }
    
            const { pricePerUnit, totalItemPrice } = calculateItemPrice(item.product, item.quantity);
            totalAmount += totalItemPrice;
    
            orderProducts.push({
                product: item.product._id,
                name: item.product.name, // Store name at purchase time
                price: pricePerUnit,     // Store discounted price per unit
                quantity: item.quantity,
                image: item.product.images[0]?.url || 'placeholder_image_url', // Store main image URL
            });
        }
    
        // 3. Create an Order in your database with 'pending' status
        // The `paytmOrderId` will be our internal order ID for Paytm reference
        const order = await Order.create({
            user: userId,
            products: orderProducts,
            totalAmount: totalAmount,
            tax: 0, // Calculate tax if applicable
            shippingInfo: shippingInfo,
            status: 'pending', // Order pending payment
            paymentMethod: 'paytm_pg', // Indicate payment method
            paymentStatus: 'pending',
            shippingCharges: 0, // Calculate shipping charges if applicable
            // paytmOrderId: `ORDER_${Date.now()}_${userId.toString().slice(-5)}`, // Unique ID for Paytm
        });
    
        if (!order) {
            throw new ApiError(500, "Failed to create order in database.");
        }
    
        // 4. Construct the PhonePe request payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            amount: totalAmount * 100, // Amount must be in paisa
            redirectUrl: `${REDIRECT_URL}/payment-status/${merchantTransactionId}`, // URL to redirect user to
            redirectMode: 'REDIRECT',
            mobileNumber: mobileNumber,
            paymentInstrument: {
                type: 'PAY_PAGE',
            },
        };
    
        // 2. Base64 encode the payload
        const payloadString = JSON.stringify(payload);
        const base64Payload = Buffer.from(payloadString).toString('base64');

        // 3. Generate the checksum
        const stringToHash = base64Payload + '/pg/v1/pay' + SALT_KEY;
        const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = `${sha256Hash}###${SALT_INDEX}`;

        // 4. Send the request to the PhonePe API
        const response = await axios.post(
            PAY_API_URL,
            { request: base64Payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'accept': 'application/json',
                },
            }
        );

        // 5. Handle the API response
        if (response.data && response.data.success && response.data.data.instrumentResponse.redirectInfo) {
            const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
            return res.status(200).json({ success: true, redirectUrl });
        } else {
            console.error('PhonePe API response error:', response.data);
            return res.status(500).json({
                success: false,
                message: 'Failed to initiate payment.',
                details: response.data,
            });
        }
    
        
    } catch (error) {
        throw new ApiError(500, "Failed to createOrderAndInitiatePaytm: ", error);
    }
});


/**
 * Handles the callback from PhonePe and verifies payment status.
 * This is a crucial step for final order confirmation.
 * NOTE: For full security, you should implement a webhook listener.
 * This is a basic redirect-based status check.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
export const checkPaymentStatus = async (req, res) => {
    try {
        const { merchantTransactionId } = req.params;

        // Construct the string for the status check checksum
        const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY;
        const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = `${sha256Hash}###${SALT_INDEX}`;
        
        // Make the API call to check the status
        const statusResponse = await axios.get(
            `${PAY_API_URL.replace('/pay', '')}/status/${MERCHANT_ID}/${merchantTransactionId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': MERCHANT_ID,
                    'accept': 'application/json',
                },
            }
        );

        const status = statusResponse.data.code;

        // Based on the status, you can update your database and redirect
        if (status === 'PAYMENT_SUCCESS') {
            // TODO: Update your order in the database to 'PAID' or 'COMPLETED'
            return res.redirect(`${REDIRECT_URL}/success?transactionId=${merchantTransactionId}`);
        } else {
            // TODO: Update your order in the database to 'FAILED' or 'PENDING'
            return res.redirect(`${REDIRECT_URL}/failure?transactionId=${merchantTransactionId}`);
        }

    } catch (error) {
        console.error('Error in checkPaymentStatus:', error);
        res.redirect(`${REDIRECT_URL}/failure?error=internal_server_error`);
    }
};


/**
 * Initiates a refund for a successful PhonePe transaction.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
export const initiateRefund = async (req, res) => {
    try {
        const { originalTransactionId, amount, mobileNumber } = req.body;

        if (!originalTransactionId || !amount || !mobileNumber) {
            return res.status(400).json({ success: false, message: 'Original transaction ID, amount, and mobile number are required.' });
        }

        // Generate a unique transaction ID for the refund
        const merchantRefundId = uuidv4();

        // 1. Construct the refund request payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: merchantRefundId, // This is the ID for the refund transaction
            originalTransactionId: originalTransactionId, // This is the original transaction ID to be refunded
            amount: amount * 100, // Amount must be in paisa
            callbackUrl: `${REDIRECT_URL}/refund-status/${merchantRefundId}`, // URL for a webhook callback (recommended)
            mobileNumber: mobileNumber
        };

        // 2. Base64 encode the payload
        const payloadString = JSON.stringify(payload);
        const base64Payload = Buffer.from(payloadString).toString('base64');

        // 3. Generate the checksum
        const stringToHash = base64Payload + '/pg/v1/refund' + SALT_KEY;
        const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = `${sha256Hash}###${SALT_INDEX}`;

        // 4. Send the request to the PhonePe API
        const response = await axios.post(
            REFUND_API_URL,
            { request: base64Payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'accept': 'application/json',
                },
            }
        );

        // 5. Handle the API response
        if (response.data && response.data.success) {
            
            
            return res.status(200).json({
                success: true,
                message: 'Refund initiated successfully. Check status for final confirmation.',
                data: response.data.data
            });
        } else {
            console.error('PhonePe refund API response error:', response.data);
            return res.status(500).json({
                success: false,
                message: 'Failed to initiate refund.',
                details: response.data,
            });
        }
    } catch (error) {
        console.error('Error in initiateRefund:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};


/**
 * Checks the status of a specific refund transaction.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
export const checkRefundStatus = async (req, res) => {
    try {
        const { merchantRefundId } = req.params;

        // Construct the string for the status check checksum
        const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${merchantRefundId}` + SALT_KEY;
        const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = `${sha256Hash}###${SALT_INDEX}`;

        // Make the API call to check the status
        const statusResponse = await axios.get(
            `${REFUND_API_URL.replace('/refund', '')}/status/${MERCHANT_ID}/${merchantRefundId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': MERCHANT_ID,
                    'accept': 'application/json',
                },
            }
        );

        const status = statusResponse.data.code;

        return res.status(200).json({
            success: true,
            status: statusResponse.data,
        });

    } catch (error) {
        console.error('Error in checkRefundStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};



// --- Unified Paytm Callback to handle both Order Payments and Wallet Deposits ---
// This endpoint must be publicly accessible from Paytm.
const paytmCallback = asyncHandler(async (req, res, next) => {
    try {
        const received_params = req.body;
        console.log("Paytm Callback received:", received_params);
    
        const paytmOrderId = received_params.ORDERID; // This is the ID we sent to Paytm
        const paytmChecksum = received_params.CHECKSUMHASH;
        const paytmTxnId = received_params.TXNID;
        const paytmTransactionStatus = received_params.STATUS; // e.g., "TXN_SUCCESS", "TXN_FAILURE", "PENDING"
    
        // Determine if it's an Order payment or a Wallet deposit based on query params
        const orderIdFromQuery = req.query.orderId;
        const walletTxnIdFromQuery = req.query.walletTxnId;
    
        const isVerifySignature = PaytmChecksum.verifySignature(
            received_params,
            PAYTM_PG_CONFIG.MERCHANT_KEY,
            paytmChecksum
        );
    
        if (!isVerifySignature) {
            console.error('Paytm Callback: Checksum verification failed for ID:', paytmOrderId);
            return res.status(400).send("Invalid signature.");
        }
    
        // --- Handle Order Payment Callback ---
        if (orderIdFromQuery) {
            const order = await Order.findById(orderIdFromQuery);
    
            if (!order) {
                console.error("Paytm Callback (Order): Order not found in DB for ID:", orderIdFromQuery);
                return res.status(404).send("Order not found.");
            }
    
            // Ensure the Paytm order ID matches
            if (order.paytmOrderId !== paytmOrderId) {
                console.error("Paytm Callback (Order): Mismatch in Paytm Order ID. Expected:", order.paytmOrderId, "Received:", paytmOrderId);
                return res.status(400).send("Order ID mismatch.");
            }
    
            const session = await mongoose.startSession();
            session.startTransaction();
    
            try {
                let appPaymentStatus = 'failed';
                let orderFulfillmentStatus = 'pending'; // Default for order status
    
                if (paytmTransactionStatus === 'TXN_SUCCESS') {
                    appPaymentStatus = 'paid';
                    orderFulfillmentStatus = 'processing'; // Order moves to processing after payment
    
                    if (order.paymentStatus === 'pending') { // Only update if not already processed
                        order.paytmTxnId = paytmTxnId;
                        order.paymentStatus = appPaymentStatus;
                        order.status = orderFulfillmentStatus;
                        order.paidAt = Date.now();
                        order.paymentMethod = received_params.PAYMENTMODE || 'paytm_pg'; // Update actual payment method
    
                        // Decrement inventory stock for each product in the order
                        for (const item of order.products) {
                            await Inventory.findOneAndUpdate(
                                { productId: item.product },
                                { $inc: { stock: -item.quantity } },
                                { new: true, session }
                            );
                        }
                        // Clear the user's cart after successful payment
                        await Cart.findOneAndUpdate({ user: order.user }, { $set: { products: [] } }, { session });
    
                        // Create a Transaction record for this order payment
                        await Transaction.create([{
                            user: order.user,
                            amount: order.totalAmount,
                            type: 'order_payment',
                            status: 'completed',
                            paymentGateway: 'paytm_pg',
                            gatewayOrderId: paytmOrderId,
                            gatewayTxnId: paytmTxnId,
                            orderRef: order._id,
                            reason: `Payment for Order ID: ${order._id}`
                        }], { session });
    
                        console.log(`Order ${order._id} marked as PAID. Inventory updated. Cart cleared. Transaction recorded.`);
                    } else {
                        console.warn(`Order ${order._id} (Paytm ID: ${paytmOrderId}) already processed or in unexpected state: ${order.paymentStatus}. Skipping inventory update.`);
                    }
                } else if (paytmTransactionStatus === 'PENDING') {
                    appPaymentStatus = 'pending';
                    orderFulfillmentStatus = 'pending';
                    order.paymentStatus = appPaymentStatus;
                    order.status = orderFulfillmentStatus;
                    console.log(`Order ${order._id} (Paytm ID: ${paytmOrderId}) is PENDING.`);
                } else { // TXN_FAILURE or other statuses
                    appPaymentStatus = 'failed';
                    orderFulfillmentStatus = 'cancelled'; // Mark order as cancelled if payment failed
                    order.paymentStatus = appPaymentStatus;
                    order.status = orderFulfillmentStatus;
    
                    // Create a Transaction record for failed payment
                    await Transaction.create([{
                        user: order.user,
                        amount: order.totalAmount,
                        type: 'order_payment',
                        status: 'failed',
                        paymentGateway: 'paytm_pg',
                        gatewayOrderId: paytmOrderId,
                        gatewayTxnId: paytmTxnId,
                        orderRef: order._id,
                        reason: `Failed payment for Order ID: ${order._id}`
                    }], { session });
    
                    console.log(`Order ${order._id} (Paytm ID: ${paytmOrderId}) FAILED. Status: ${paytmTransactionStatus}. Order cancelled.`);
                }
                order.paytmResponse = received_params; // Store full response for debugging
                await order.save({ session });
    
                await session.commitTransaction();
                session.endSession();
    
                res.status(200).json({ status: 'ok', message: `Order status for order ${orderIdFromQuery} processed.` });
    
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                console.error("Error processing order payment callback:", error);
                res.status(500).send("Internal Server Error during order payment processing.");
            }
        }
        // --- Handle Wallet Deposit Callback ---
        else if (walletTxnIdFromQuery) {
            const transaction = await Transaction.findById(walletTxnIdFromQuery); // Find the existing Transaction record
    
            if (!transaction) {
                console.error("Paytm Callback (Deposit): Transaction not found for ID:", walletTxnIdFromQuery);
                return res.status(404).send("Transaction not found.");
            }
    
            // Ensure the Paytm order ID matches
            if (transaction.gatewayOrderId !== paytmOrderId) {
                console.error("Paytm Callback (Deposit): Mismatch in Paytm Order ID. Expected:", transaction.gatewayOrderId, "Received:", paytmOrderId);
                return res.status(400).send("Transaction ID mismatch.");
            }
    
            const session = await mongoose.startSession();
            session.startTransaction();
    
            try {
                if (paytmTransactionStatus === 'TXN_SUCCESS' && transaction.status === 'pending') {
                    transaction.gatewayTxnId = paytmTxnId;
                    transaction.status = 'completed';
                    transaction.paymentGateway = 'paytm_pg'; // Confirm payment gateway used
                    transaction.gatewayResponse = received_params;
    
                    // Increment Wallet Balance
                    const wallet = await Wallet.findOneAndUpdate(
                        { user: transaction.user },
                        { $inc: { balance: transaction.amount } },
                        { new: true, upsert: true, session }
                    );
                    await transaction.save({ session });
                    console.log(`Wallet Deposit (Txn: ${transaction._id}) COMPLETED. Wallet balance updated for user ${transaction.user}.`);
    
                } else if (paytmTransactionStatus === 'TXN_FAILURE' && transaction.status === 'pending') {
                    transaction.status = 'failed';
                    transaction.gatewayTxnId = paytmTxnId;
                    transaction.gatewayResponse = received_params;
                    await transaction.save({ session });
                    console.log(`Wallet Deposit (Txn: ${transaction._id}) FAILED.`);
    
                } else if (paytmTransactionStatus === 'PENDING' && transaction.status === 'pending') {
                    // Keep status as pending, the client can poll for final status
                    transaction.gatewayTxnId = paytmTxnId; // Update with latest txn ID if available
                    transaction.gatewayResponse = received_params;
                    await transaction.save({ session });
                    console.log(`Wallet Deposit (Txn: ${transaction._id}) is PENDING.`);
                } else {
                    console.warn(`Wallet Deposit (Txn: ${transaction._id}): Unhandled status or already processed: ${paytmTransactionStatus}.`);
                }
    
                await session.commitTransaction();
                session.endSession();
                res.status(200).json({ status: 'ok', message: `Wallet deposit status for transaction ${walletTxnIdFromQuery} processed.` });
    
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                console.error("Error processing wallet deposit callback:", error);
                res.status(500).send("Internal Server Error during wallet deposit processing.");
            }
        } else {
            console.error("Paytm Callback: Neither orderId nor walletTxnId found in query. Cannot process.");
            res.status(400).send("Invalid callback request.");
        }
    } catch (error) {
        console.error("Unexpected error in Paytm Callback:", error);
        throw new ApiError(500, "An unexpected error occurred while processing the Paytm callback.", [], error.stack);
    }
});


// --- Controller to check Order Payment Status (optional, but good for client polling) ---
const getOrderPaymentStatus = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found.");
        }
        const { orderId } = user._id; // Your internal order ID
    
        const order = await Order.findById(orderId).populate('user products.product');
    
        if (!order) {
            throw new ApiError(404, "Order not found.");
        }
    
        if (order.user.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Not authorized to view this order.");
        }
    
        // Optionally, if the order payment is still pending, you can poll Paytm's status API
        if (order.paymentStatus === 'pending' && order.paytmOrderId) {
            const paytmParams = {
                body: {
                    mid: PAYTM_PG_CONFIG.MID,
                    orderId: order.paytmOrderId,
                },
                head: {}
            };
    
            const checksum = await PaytmChecksum.generateSignature(
                JSON.stringify(paytmParams.body),
                PAYTM_PG_CONFIG.MERCHANT_KEY
            );
            paytmParams.head.signature = checksum;
    
            const post_data = JSON.stringify(paytmParams);
    
            const paytmStatusResponse = await new Promise((resolve, reject) => {
                const options = {
                    hostname: new URL(PAYTM_PG_CONFIG.BASE_URL).hostname,
                    port: 443,
                    path: '/v3/order/status', // Endpoint for status check
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': post_data.length
                    }
                };
    
                let response = "";
                const post_req = https.request(options, function (post_res) {
                    post_res.on('data', function (chunk) {
                        response += chunk;
                    });
                    post_req.on('end', function () {
                        resolve(JSON.parse(response));
                    });
                });
                post_req.on('error', function (error) {
                    reject(error);
                });
                post_req.write(post_data);
                post_req.end();
            });
    
            if (paytmStatusResponse && paytmStatusResponse.body && paytmStatusResponse.body.resultInfo && paytmStatusResponse.body.resultInfo.resultStatus === 'SUCCESS') {
                const status = paytmStatusResponse.body.txnStatus;
                console.log(`Polling Paytm for Order ${orderId}: Status is ${status}`);
    
                const session = await mongoose.startSession();
                session.startTransaction();
    
                try {
                    if (status === 'TXN_SUCCESS' && order.paymentStatus === 'pending') {
                        order.paytmTxnId = paytmStatusResponse.body.txnId;
                        order.paymentStatus = 'paid';
                        order.status = 'processing';
                        order.paidAt = Date.now();
                        order.paymentMethod = paytmStatusResponse.body.paymentMode || 'paytm_pg';
                        order.paytmResponse = paytmStatusResponse.body;
    
                        // Decrement inventory and clear cart (if not already done by webhook)
                        for (const item of order.products) {
                            await Inventory.findOneAndUpdate(
                                { productId: item.product },
                                { $inc: { stock: -item.quantity } },
                                { new: true, session }
                            );
                        }
                        await Cart.findOneAndUpdate({ user: order.user }, { $set: { products: [] } }, { session });
    
                        // Create a Transaction record for this order payment
                        await Transaction.create([{
                            user: order.user,
                            amount: order.totalAmount,
                            type: 'order_payment',
                            status: 'completed',
                            paymentGateway: 'paytm_pg',
                            gatewayOrderId: order.paytmOrderId,
                            gatewayTxnId: order.paytmTxnId,
                            orderRef: order._id,
                            reason: `Payment for Order ID: ${order._id} (Polled)`
                        }], { session });
    
                        await order.save({ session });
                        console.log(`Order ${order._id} status updated to PAID via polling.`);
    
                    } else if (status === 'TXN_FAILURE' && order.paymentStatus === 'pending') {
                        order.paytmTxnId = paytmStatusResponse.body.txnId;
                        order.paymentStatus = 'failed';
                        order.status = 'cancelled';
                        order.paytmResponse = paytmStatusResponse.body;
    
                        // Create a Transaction record for failed payment
                        await Transaction.create([{
                            user: order.user,
                            amount: order.totalAmount,
                            type: 'order_payment',
                            status: 'failed',
                            paymentGateway: 'paytm_pg',
                            gatewayOrderId: order.paytmOrderId,
                            gatewayTxnId: order.paytmTxnId,
                            orderRef: order._id,
                            reason: `Failed payment for Order ID: ${order._id} (Polled)`
                        }], { session });
    
                        await order.save({ session });
                        console.log(`Order ${order._id} status updated to FAILED via polling.`);
                    } else {
                        console.log(`Order ${order._id} current status: ${order.paymentStatus}. Paytm polling status: ${status}. No change.`);
                    }
                    await session.commitTransaction();
                    session.endSession();
                } catch (error) {
                    await session.abortTransaction();
                    session.endSession();
                    console.error("Error during polling order status transaction:", error);
                    throw error;
                }
            }
        }
    
        return res
        .status(200)
        .json(new ApiResponse(200, order, "Order status retrieved successfully."));
    } catch (error) {
        console.error("Error retrieving order payment status:", error);
        throw new ApiError(500, "An unexpected error occurred while retrieving the order payment status.", [], error.stack);
    }
});


export {
    createOrderAndInitiatePaytm,
    paytmCallback,
    getOrderPaymentStatus
}