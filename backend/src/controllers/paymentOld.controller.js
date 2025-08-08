import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {Order} from'../models/orders.model.js';
import {User} from'../models/user.model.js';
import {Cart} from'../models/cart.model.js';
import {Inventory} from'../models/inventory.model.js';
import {calculateItemPrice} from "../utils/discountCalculations.js";

import PaytmChecksum from 'paytmchecksum';
import https from 'https'; // Node's built-in https module for Paytm API calls

// Paytm Configuration
const PAYTM_CONFIG = {
    MID: process.env.PAYTM_MID,
    MERCHANT_KEY: process.env.PAYTM_MERCHANT_KEY,
    WEBSITE: process.env.PAYTM_WEBSITE,
    CHANNEL_ID: process.env.PAYTM_CHANNEL_ID,
    INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE_ID,
    CALLBACK_URL: process.env.PAYTM_CALLBACK_URL,
    // Base URLs for Paytm API based on environment
    BASE_URL: process.env.PAYTM_ENV === "PRODUCTION"
        ? "https://securegw.paytm.in"
        : "https://securegw-stage.paytm.in"
};


// --- Controller to create a payment order and get transaction token ---
/**
 * @desc Create a Paytm order and get transaction token
 * @route POST /api/orders/create-paytm-order
 * @route /api/orders/payment/paytm/create-order
 * @param {Object} req - Request object containing user authentication and cart details
 * @param {Object} res - Response object to send back the transaction token and order details
 * @access Private
 * @body {Object} - Contains cart items and user details
 */
const createPaytmOrder = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id; // Assumes user is authenticated
    
        // 1. Fetch user's cart
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
    
        if (!cart || cart.products.length === 0) {
            throw new ApiError(400, "Your cart is empty. Cannot create an order.");
        }
    
        // 2. Calculate total amount and prepare products for order
        let totalAmount = 0;
        const orderProducts = [];
    
        for (const item of cart.products) {
            if (!item.product) {
                throw new ApiError(500, "Product not found for an item in cart.");
            }
            // Check inventory stock (Crucial for atomic inventory update after successful payment)
            const inventory = await Inventory.findOne({ productId: item.product._id });
            if (!inventory || inventory.stock < item.quantity) {
                throw new ApiError(409, `Insufficient stock for ${item.product.name}. Available: ${inventory ? inventory.stock : 0}, Requested: ${item.quantity}.`);
            }

            // --- USING THE BULK DISCOUNT CALCULATION ---
            const { pricePerUnit, totalItemPrice } = calculateItemPrice(item.product, item.quantity);
            totalAmount += totalItemPrice;
            // --- END BULK DISCOUNT CALCULATION ---
    
            orderProducts.push({
                product: item.product._id,
                quantity: item.quantity,
                priceAtPurchase: pricePerUnit //actual discounted price at time of purchase
                // Capture price at the moment of order creation
            });
        }
    
        // 3. Create an order in your database with 'pending' status
        const order = await Order.create({
            user: userId,
            products: orderProducts,
            totalAmount: totalAmount,
            paytmOrderId: order._id.toString(), // Use your internal order ID as Paytm's ORDER_ID
            paymentStatus: 'pending'
        });
    
        if (!order) {
            throw new ApiError(500, "Failed to create order in database.");
        }
    
        // 4. Prepare parameters for Paytm Initiate Transaction API
        const paytmParams = {
            body: {
                requestType: "Payment",
                mid: PAYTM_CONFIG.MID,
                websiteName: PAYTM_CONFIG.WEBSITE,
                orderId: order.paytmOrderId, // Your internal order ID
                txnAmount: {
                    value: totalAmount.toFixed(2), // Amount with 2 decimal places
                    currency: "INR",
                },
                userInfo: {
                    custId: userId.toString(), // Customer ID from your user model
                },
                // The callbackUrl here is for the client-side redirect after payment.
                // For webhook, you'd configure it in Paytm dashboard.
                callbackUrl: `${PAYTM_CONFIG.CALLBACK_URL}?orderId=${order.paytmOrderId}`,
            },
            head: {} // Checksum will be added here
        };
    
        // 5. Generate Checksum for the request body
        const checksum = await PaytmChecksum.generateSignature(
            JSON.stringify(paytmParams.body),
            PAYTM_CONFIG.MERCHANT_KEY
        );
    
        paytmParams.head.signature = checksum;
    
        const post_data = JSON.stringify(paytmParams);
    
        // 6. Call Paytm Initiate Transaction API
        const paytmResponse = await new Promise((resolve, reject) => {
            const options = {
                hostname: new URL(PAYTM_CONFIG.BASE_URL).hostname, // Extract hostname
                port: 443,
                path: '/theia/api/v1/initiateTransaction?mid=' + PAYTM_CONFIG.MID + '&orderId=' + order.paytmOrderId,
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
                post_res.on('end', function () {
                    resolve(JSON.parse(response));
                });
            });
    
            post_req.on('error', function (error) {
                reject(error);
            });
    
            post_req.write(post_data);
            post_req.end();
        });
    
        if (!paytmResponse || paytmResponse.head.responseCode !== '200' || !paytmResponse.body.txnToken) {
            console.error("Paytm Initiate Transaction API Error:", paytmResponse);
            order.paymentStatus = 'failed';
            await order.save();
            throw new ApiError(500, paytmResponse.body.resultInfo?.resultMsg || "Failed to initiate payment with Paytm.");
        }
    
        // 7. Update your internal order with Paytm's transaction token
        order.paytmTxnToken = paytmResponse.body.txnToken;
        await order.save();
    
        // 8. Send necessary details to frontend
        res.status(200).json(new ApiResponse(200, {
            orderId: order._id, // Your internal order ID
            mid: PAYTM_CONFIG.MID,
            txnToken: paytmResponse.body.txnToken,
            amount: totalAmount.toFixed(2), // Send string for precision
            callbackUrl: PAYTM_CONFIG.CALLBACK_URL,
            isStaging: PAYTM_CONFIG.PAYTM_ENV === "STAGING",
            // Additional info for client (optional)
            userInfo: {
                custId: userId.toString(),
                // Add more user details if needed for prefill
            }
        }, "Paytm transaction token generated successfully."));
    } catch (error) {
        console.error("Error creating Paytm order:", error);
        throw new ApiError(500, "Failed to create Paytm order.", [], error.stack);
    }
});


// --- Webhook/Callback to handle payment status updates from Paytm ---
// This endpoint must be publicly accessible from Paytm.
// For callback, Paytm sends data as x-www-form-urlencoded POST.
// For webhook, it depends on configuration, but often JSON.
// You need to set up a specific "Callback URL" in your Paytm dashboard for transaction status.
// And optionally a "Webhook URL" for async notifications.
const paytmCallback = asyncHandler(async (req, res, next) => {
    try {
        // Paytm sends data as x-www-form-urlencoded, so use req.body directly if bodyParser is configured for it.
        // Ensure you use `express.urlencoded({ extended: true, verify: (req, res, buf) => { req.rawBody = buf; } })`
        // for this endpoint to get raw body if you need to verify it from `req.rawBody`
        const received_params = req.body;
        console.log("Paytm Callback received:", received_params);
    
        const orderId = received_params.ORDERID;
        const paytmChecksum = received_params.CHECKSUMHASH;
    
        // 1. Verify Checksum
        const isVerifySignature = PaytmChecksum.verifySignature(
            received_params,
            PAYTM_CONFIG.MERCHANT_KEY,
            paytmChecksum
        );
    
        if (!isVerifySignature) {
            console.error('Paytm Callback: Checksum verification failed for Order ID:', orderId);
            return res.status(400).send("Invalid signature.");
        }
    
        // 2. Fetch the order from your database
        const order = await Order.findOne({ paytmOrderId: orderId });
    
        if (!order) {
            console.error("Paytm Callback: Order not found in DB for Order ID:", orderId);
            return res.status(404).send("Order not found.");
        }
    
        // 3. Update order status based on Paytm's response
        const paytmTransactionStatus = received_params.STATUS; // e.g., "TXN_SUCCESS", "TXN_FAILURE", "PENDING"
        order.paytmTxnId = received_params.TXNID;
        order.paytmPaymentStatus = paytmTransactionStatus;
        order.paytmResponse = received_params; // Store full response for debugging
    
        let appPaymentStatus = 'failed'; // Default to failed
    
        if (paytmTransactionStatus === 'TXN_SUCCESS') {
            appPaymentStatus = 'paid';
            order.paymentMethod = received_params.PAYMENTMODE || 'unknown'; // e.g., "CARD", "UPI", "NB"
    
            if (order.paymentStatus === 'pending') { // Only update if not already processed
                order.paymentStatus = appPaymentStatus;
    
                // --- Crucial: Update Inventory and Clear Cart ---
                for (const item of order.products) {
                    await Inventory.findOneAndUpdate(
                        { productId: item.product },
                        { $inc: { stock: -item.quantity } },
                        { new: true }
                    );
                }
                await Cart.findOneAndUpdate({ user: order.user }, { $set: { products: [] } });
    
                console.log(`Order ${order._id} marked as PAID. Inventory updated. Cart cleared.`);
            } else {
                console.warn(`Order ${order._id} (Paytm ID: ${orderId}) already processed or in unexpected state: ${order.paymentStatus}. Skipping inventory update.`);
            }
        } else if (paytmTransactionStatus === 'PENDING') {
            appPaymentStatus = 'pending';
            order.paymentStatus = appPaymentStatus; // Keep as pending
            console.log(`Order ${order._id} (Paytm ID: ${orderId}) is PENDING.`);
        } else { // TXN_FAILURE or other statuses
            appPaymentStatus = 'failed';
            order.paymentStatus = appPaymentStatus;
            console.log(`Order ${order._id} (Paytm ID: ${orderId}) FAILED. Status: ${paytmTransactionStatus}`);
        }
    
        await order.save();
    
        // 4. Send a response back to Paytm or redirect user
        // For a traditional callback, you might render a simple success/failure page or redirect.
        // For a webhook, just send 200 OK.
        // For client-side driven flows, you might just send a JSON response.
        // Depending on your `CALLBACK_URL` configuration in Paytm dashboard,
        // Paytm might expect a simple HTML response or just a 200 OK.
        // For app-based flows, it's usually just a 200 OK and then the app queries the backend for status.
        res.status(200).json({
            message: "Payment status updated successfully.",
            orderStatus: appPaymentStatus,
            paytmStatus: paytmTransactionStatus
        });
    
        // Alternatively, if you want Paytm to redirect the user to a specific page
        // res.redirect(`YOUR_FRONTEND_URL/payment-status?orderId=${order._id}&status=${appPaymentStatus}`);
    } catch (error) {
        console.error("Paytm Callback Error:", error);
        throw new ApiError(500, "Failed to process Paytm callback.");
    };
});


/**
 * @desc Get Paytm order status
 * @route GET /api/orders/:orderId/paytm-status
 * @access Private
 * @param {string} orderId - Your internal order ID
 * @returns {Object} - Order details with payment status
 */
// --- Controller to check payment status (optional, but good for client polling) ---
const getPaytmOrderStatus = asyncHandler(async (req, res, next) => {

    try {
        const { orderId } = req.params; // Your internal order ID
    
        const order = await Order.findById(orderId).populate('user products.product');
    
        if (!order) {
            throw new ApiError(404, "Order not found.");
        }
    
        if (order.user.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Not authorized to view this order.");
        }
    
        // Optionally, if the order is still pending, you can poll Paytm's status API
        if (order.paymentStatus === 'pending' && order.paytmOrderId) {
            const paytmParams = {
                body: {
                    mid: PAYTM_CONFIG.MID,
                    orderId: order.paytmOrderId,
                },
                head: {}
            };
    
            const checksum = await PaytmChecksum.generateSignature(
                JSON.stringify(paytmParams.body),
                PAYTM_CONFIG.MERCHANT_KEY
            );
            paytmParams.head.signature = checksum;
    
            const post_data = JSON.stringify(paytmParams);
    
            const paytmStatusResponse = await new Promise((resolve, reject) => {
                const options = {
                    hostname: new URL(PAYTM_CONFIG.BASE_URL).hostname,
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
                    post_res.on('end', function () {
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
    
                if (status === 'TXN_SUCCESS' && order.paymentStatus === 'pending') {
                    order.paytmTxnId = paytmStatusResponse.body.txnId;
                    order.paytmPaymentStatus = status;
                    order.paymentStatus = 'paid';
                    order.paymentMethod = paytmStatusResponse.body.paymentMode;
                    order.paytmResponse = paytmStatusResponse.body; // Update full response
    
                    // Decrement inventory and clear cart (if not already done by webhook)
                    for (const item of order.products) {
                        await Inventory.findOneAndUpdate(
                            { productId: item.product },
                            { $inc: { stock: -item.quantity } },
                            { new: true }
                        );
                    }
                    await Cart.findOneAndUpdate({ user: order.user }, { $set: { products: [] } });
                    await order.save();
                    console.log(`Order ${order._id} status updated to PAID via polling.`);
    
                } else if (status === 'TXN_FAILURE' && order.paymentStatus === 'pending') {
                    order.paytmTxnId = paytmStatusResponse.body.txnId;
                    order.paytmPaymentStatus = status;
                    order.paymentStatus = 'failed';
                    order.paytmResponse = paytmStatusResponse.body;
                    await order.save();
                    console.log(`Order ${order._id} status updated to FAILED via polling.`);
                } else {
                     console.log(`Order ${order._id} current status: ${order.paymentStatus}. Paytm polling status: ${status}. No change.`);
                }
            }
        }
    
        return res
        .status(200)
        .json(new ApiResponse(200, order, "Order status retrieved successfully."));
    } catch (error) {
        console.error("Error retrieving Paytm order status:", error);
        return next(new ApiError(500, "Failed to retrieve order status."));
        
    }
});


export {
    createPaytmOrder,
    paytmCallback,
    getPaytmOrderStatus
};


