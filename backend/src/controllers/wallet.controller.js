// controllers/walletController.js

import {User} from '../models/user.model.js';
import {Wallet} from '../models/wallet.model.js'; // Use the updated Wallet model
import {Transaction} from '../models/transaction.model.js'; // Use the new Transaction model
import {Order} from '../models/orders.model.js'; // Your main Order model
import {Product} from '../models/products.model.js';
import {Inventory} from '../models/inventory.model.js';
import {Cart} from '../models/cart.model.js'; // For payWithWallet

import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import { calculateItemPrice } from '../utils/discountCalculations.js'; // Assuming this helper

import PaytmChecksum from 'paytmchecksum';
import https from 'https';
import mongoose from 'mongoose'; // Import mongoose for sessions

// --- Paytm Payment Gateway Config (for DEPOSITS) ---
const PAYTM_PG_CONFIG = {
    MID: process.env.PAYTM_MID,
    MERCHANT_KEY: process.env.PAYTM_MERCHANT_KEY,
    WEBSITE: process.env.PAYTM_WEBSITE,
    CHANNEL_ID: process.env.PAYTM_CHANNEL_ID,
    INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE_ID,
    CALLBACK_URL: process.env.PAYTM_CALLBACK_URL, // Generic callback used for PG
    BASE_URL: process.env.PAYTM_ENV === "PRODUCTION"
        ? "https://securegw.paytm.in"
        : "https://securegw-stage.paytm.in"
};

// --- Paytm Payouts Config (for WITHDRAWALS) ---
const PAYTM_PAYOUTS_CONFIG = {
    MID: process.env.PAYTM_PAYOUTS_MID,
    MERCHANT_KEY: process.env.PAYTM_PAYOUTS_KEY,
    CLIENT_ID: process.env.PAYTM_PAYOUTS_CLIENT_ID,
    WEBSITE: process.env.PAYTM_PAYOUTS_WEBSITE,
    // IMPORTANT: THESE BASE_URLS ARE ILLUSTRATIVE. YOU MUST GET THEM FROM PAYTM PAYOUTS API DOCS.
    // Example for Payouts API base URL (often different from PG)
    BASE_URL: process.env.PAYTM_PAYOUTS_ENV === "PRODUCTION"
        ? "https://securegw.paytm.in/merchant-m2m-api" // Example Payouts URL
        : "https://securegw-stage.paytm.in/merchant-m2m-api", // Example Staging Payouts URL
    PAYOUTS_CALLBACK_URL: process.env.PAYTM_PAYOUTS_CALLBACK_URL, // Payout specific webhook/callback
};


// --- Controller for initiating a DEPOSIT to Wallet ---
/**
 * Initiates a deposit into the user's wallet using Paytm Payment Gateway.
 *
 * @param {Object} req - Express request object containing user information and deposit amount.
 * @param {Object} res - Express response object to send back the result.
 * @throws {ApiError} Throws an error if there's any issue with creating the transaction or generating the Paytm token.
 * @desc This controller handles the initiation of a deposit into the user's wallet via Paytm Payment Gateway.
 * It creates a transaction record, generates a unique order ID, prepares parameters for Paytm,
 * calculates checksum, initiates the transaction through Paytm API, updates the transaction record,
 * and sends necessary details back to the client for redirection to complete the payment.
 * It also includes checks for valid amounts and ensures that the user exists before proceeding.
 * @route POST /api/wallet/deposit
 */
const initiateWalletDeposit = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const { amount } = req.body;
        const userId = user._id;
    
        if (typeof amount !== 'number' || amount <= 0) {
            throw new ApiError(400, "Deposit amount must be a positive number.");
        }
    
        // 1. Ensure user has a wallet, create if not
        let wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            wallet = await Wallet.create({ user: userId, balance: 0 });
        }
    
        // 2. Create a pending Transaction record for deposit
        const transaction = await Transaction.create({
            user: userId,
            amount: amount,
            type: 'deposit',
            status: 'pending',
            paymentGateway: 'paytm_pg',
            reason: `Deposit of ₹${amount} to wallet`,
            gatewayOrderId: `DEPOSIT_${Date.now()}_${userId.toString().slice(-5)}`, // Unique ID for Paytm
        });
    
        if (!transaction) {
            throw new ApiError(500, "Failed to create deposit transaction record.");
        }
    
        // 3. Prepare parameters for Paytm Payment Gateway
        const paytmParams = {
            body: {
                requestType: "Payment",
                mid: PAYTM_PG_CONFIG.MID,
                websiteName: PAYTM_PG_CONFIG.WEBSITE,
                orderId: transaction.gatewayOrderId, // Use transaction's gatewayOrderId as Paytm's ORDER_ID
                txnAmount: {
                    value: amount.toFixed(2),
                    currency: "INR",
                },
                userInfo: {
                    custId: userId.toString(),
                },
                // The callbackUrl for the client-side redirect after payment.
                // We pass the Transaction ID to differentiate it from Order payments in the callback.
                callbackUrl: `${PAYTM_PG_CONFIG.CALLBACK_URL}?walletTxnId=${transaction._id.toString()}`,
            },
            head: {}
        };
    
        // 4. Generate Checksum
        const checksum = await PaytmChecksum.generateSignature(
            JSON.stringify(paytmParams.body),
            PAYTM_PG_CONFIG.MERCHANT_KEY
        );
        paytmParams.head.signature = checksum;
    
        const post_data = JSON.stringify(paytmParams);
    
        // 5. Call Paytm Initiate Transaction API
        const paytmResponse = await new Promise((resolve, reject) => {
            const options = {
                hostname: new URL(PAYTM_PG_CONFIG.BASE_URL).hostname,
                port: 443,
                path: '/theia/api/v1/initiateTransaction?mid=' + PAYTM_PG_CONFIG.MID + '&orderId=' + transaction.gatewayOrderId,
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
    
        if (!paytmResponse || paytmResponse.head.responseCode !== '200' || !paytmResponse.body.txnToken) {
            console.error("Paytm Deposit Initiate Transaction API Error:", paytmResponse);
            transaction.status = 'failed';
            transaction.gatewayResponse = paytmResponse;
            await transaction.save();
            throw new ApiError(500, paytmResponse.body.resultInfo?.resultMsg || "Failed to initiate deposit with Paytm.");
        }
    
        // 6. Update transaction with Paytm token
        transaction.gatewayTxnId = paytmResponse.body.txnToken; // Store token here for linking
        transaction.gatewayResponse = paytmResponse;
        await transaction.save();
    
        // 7. Send details to frontend for payment
        return res
        .status(200)
        .json(new ApiResponse(
            200, {
            transactionId: transaction._id, // Your internal transaction ID
            mid: PAYTM_PG_CONFIG.MID,
            txnToken: paytmResponse.body.txnToken,
            amount: amount.toFixed(2),
            callbackUrl: `${PAYTM_PG_CONFIG.CALLBACK_URL}?walletTxnId=${transaction._id.toString()}`,
            isStaging: PAYTM_PG_CONFIG.PAYTM_ENV === "STAGING",
            userInfo: {
                custId: userId.toString(),
            }
        }, "Paytm transaction token for deposit generated successfully."));
    } catch (error) {
        console.error("Error initiating wallet deposit:", error);
        throw new ApiError(500, "Failed to initiate wallet deposit. Please try again later.");
    }
});

// --- CONTROLLER FOR WITHDRAWAL FROM WALLET ---
/** 
 * Initiates a withdrawal from the user's wallet using Paytm Payouts.
*
* @param {Object} req - Express request object containing user information, withdrawal amount, and details.
* @param {Object} res - Express response object to send back the result.
* @throws {ApiError} Throws an error if there's any issue with creating the transaction, validating inputs,
* or interacting with Paytm Payouts API.
* @desc This controller handles the initiation of a withdrawal from the user's wallet via Paytm Payouts.
* It validates input parameters such as withdrawal amount and beneficiary details, checks if the
* user has enough balance, and then proceeds to create a transaction record, generate a unique order ID,
* prepare parameters for Paytm Payouts API, calculate checksum, initiate the withdrawal through Paytm Payouts API,
* update the transaction record, and finally deduct the balance from the wallet.
* It also includes checks for valid amounts and ensures that the user exists before proceeding.
* @route POST /api/wallet/withdrawal
*/
const initiateWalletWithdrawal = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const { amount, withdrawalDetails } = req.body;
        const userId = user._id;
    
        if (typeof amount !== 'number' || amount <= 0) {
            throw new ApiError(400, "Withdrawal amount must be a positive number.");
        }
        if (!withdrawalDetails || (!withdrawalDetails.bankAccount && !withdrawalDetails.upiId)) {
            throw new ApiError(400, "Please provide bank account/IFSC or UPI ID for withdrawal.");
        }
        if (!withdrawalDetails.beneficiaryName || withdrawalDetails.beneficiaryName.trim() === '') {
            throw new ApiError(400, "Beneficiary name is required for withdrawal.");
        }
    
        // 1. Fetch user's wallet
        let wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            throw new ApiError(404, "Wallet not found for this user.");
        }
    
        // 2. Check if sufficient balance
        if (wallet.balance < amount) {
            throw new ApiError(400, `Insufficient wallet balance. Current: ₹${wallet.balance}, Requested: ₹${amount}.`);
        }
    
        // 3. Create a pending Transaction record for withdrawal
        const transaction = await Transaction.create({
            user: userId,
            amount: amount,
            type: 'withdrawal',
            status: 'pending',
            paymentGateway: 'paytm_payouts', // Indicate Payouts
            reason: `Withdrawal of ₹${amount} from wallet`,
            withdrawalDetails: {
                bankAccount: withdrawalDetails.bankAccount || null,
                ifscCode: withdrawalDetails.ifscCode || null,
                upiId: withdrawalDetails.upiId || null,
                beneficiaryName: withdrawalDetails.beneficiaryName.trim()
            },
            gatewayOrderId: `WITHDRAWAL_${Date.now()}_${userId.toString().slice(-5)}`, // Unique ID for Payouts
        });
    
        if (!transaction) {
            throw new ApiError(500, "Failed to create withdrawal transaction record.");
        }
    
        // 4. Prepare parameters for Paytm Payouts API
        // IMPORTANT: The actual API endpoint and request structure for Payouts
        // vary based on Paytm's latest documentation and your specific Payouts account.
        // The details below are illustrative. YOU MUST REFER TO PAYTM PAYOUTS API DOCS.
        let paytmPayoutsParams;
        let payoutsApiPath;
    
        if (withdrawalDetails.upiId) {
            paytmPayoutsParams = {
                requestGuid: transaction.gatewayOrderId, // Unique request ID
                mid: PAYTM_PAYOUTS_CONFIG.MID,
                payeeAccount: withdrawalDetails.upiId,
                payeeVPA: withdrawalDetails.upiId,
                amount: amount.toFixed(2),
                purpose: "Wallet Withdrawal",
                callbackUrl: PAYTM_PAYOUTS_CONFIG.PAYOUTS_CALLBACK_URL,
                // ... more params from Paytm Payouts UPI API
            };
            payoutsApiPath = '/payout/v1/disburse/upi'; // Illustrative path, confirm with Paytm docs
    
        } else if (withdrawalDetails.bankAccount && withdrawalDetails.ifscCode) {
            paytmPayoutsParams = {
                requestGuid: transaction.gatewayOrderId,
                mid: PAYTM_PAYOUTS_CONFIG.MID,
                payeeAccount: withdrawalDetails.bankAccount,
                ifsc: withdrawalDetails.ifscCode,
                amount: amount.toFixed(2),
                purpose: "Wallet Withdrawal",
                callbackUrl: PAYTM_PAYOUTS_CONFIG.PAYOUTS_CALLBACK_URL,
                // ... more params from Paytm Payouts Bank API
            };
            payoutsApiPath = '/payout/v1/disburse/bank'; // Illustrative path, confirm with Paytm docs
        } else {
            throw new ApiError(400, "Invalid withdrawal details provided.");
        }
    
        // 5. Generate Checksum for Payouts request
        const checksum = await PaytmChecksum.generateSignature(
            JSON.stringify(paytmPayoutsParams), // Payouts checksum might be on the entire body
            PAYTM_PAYOUTS_CONFIG.MERCHANT_KEY
        );
    
        // 6. Call Paytm Payouts API
        const post_data = JSON.stringify(paytmPayoutsParams);
        const payoutsResponse = await new Promise((resolve, reject) => {
            const options = {
                hostname: new URL(PAYTM_PAYOUTS_CONFIG.BASE_URL).hostname,
                port: 443,
                path: payoutsApiPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length,
                    'x-checksum': checksum, // Payouts often uses header checksum
                    // Other headers like Authorization if needed for Payouts
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
    
        if (!payoutsResponse || payoutsResponse.status !== 'SUCCESS') { // Check Payouts API response structure
            console.error("Paytm Payouts API Error:", payoutsResponse);
            transaction.status = 'failed';
            transaction.gatewayResponse = payoutsResponse;
            await transaction.save();
            throw new ApiError(500, payoutsResponse.statusMessage || "Failed to initiate withdrawal with Paytm.");
        }
    
        // 7. Update transaction with Paytm Payout ID and response
        transaction.gatewayPayoutId = payoutsResponse.payoutId || payoutsResponse.id;
        transaction.gatewayResponse = payoutsResponse;
        await transaction.save();
    
        // 8. Deduct balance immediately (or after webhook confirmation for high-risk scenarios)
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            await Wallet.findOneAndUpdate(
                { user: userId },
                { $inc: { balance: -amount } },
                { new: true, session }
            );
            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Error deducting wallet balance for withdrawal:", error);
            // If balance deduction fails, mark transaction as failed and throw error
            transaction.status = 'failed';
            transaction.reason += ' (Balance deduction failed)';
            await transaction.save();
            throw new ApiError(500, "Failed to deduct wallet balance for withdrawal. Please contact support.");
        }
    
    
        return res
        .status(200)
        .json(new ApiResponse(
            200, {
            transactionId: transaction._id,
            message: "Withdrawal initiated successfully. Balance deducted. Status is pending bank confirmation."
        }, "Withdrawal request submitted."));
    } catch (error) {
        console.error("Error initiating wallet withdrawal:", error);
		throw new ApiError(500, "Failed to initiate wallet withdrawal. Please try again later.");
    }
});


// --- Webhook for Paytm Payouts Status (CRUCIAL for withdrawals) ---
// This endpoint must be publicly accessible and configured in your Paytm Payouts dashboard.
/**
 * Handles Paytm Payouts webhooks for withdrawal status updates.
 * @desc This endpoint receives callbacks from Paytm Payouts to update the status of wallet withdrawals.	
 * * @route POST /wallet/payouts/callback
 * * @access Public (no authentication required)
 * @param {Object} req - The request object containing the webhook payload.
 * @param {Object} res - The response object to send back the result.
 * * @returns {Object} - Returns a success response acknowledging the webhook.
 * * @throws {ApiError} - Throws an error if checksum verification fails, wallet transaction not found, or any processing error occurs.
 * * @note This webhook should ideally be idempotent, meaning multiple calls with the same data should have no side effects beyond the initial one.
 * * @note In production, ensure that this endpoint is secure and cannot be accessed directly by unauthorized parties.
 */
const paytmPayoutsCallback = asyncHandler(async (req, res, next) => {
    // Ensure this route is accessible without authentication and CORS settings are correct.
    // Payouts webhooks typically send JSON, but verify with Paytm docs.
    try {
        const received_params = req.body;
        console.log("Paytm Payouts Callback received:", received_params);
    
        const payoutId = received_params.payoutId || received_params.orderId; // Use correct ID
        const status = received_params.status; // e.g., 'SUCCESS', 'FAILURE', 'PENDING'
        const checksumHash = received_params.checksumHash || received_params.signature; // Check where checksum is
    
        // 1. Verify Checksum (Payouts checksum verification might differ from PG)
        const isVerifySignature = PaytmChecksum.verifySignature(
            received_params,
            PAYTM_PAYOUTS_CONFIG.MERCHANT_KEY,
            checksumHash
        );
    
        if (!isVerifySignature) {
            console.error('Paytm Payouts Callback: Checksum verification failed for Payout ID:', payoutId);
            return res.status(400).send("Invalid signature.");
        }
    
        // 2. Find the corresponding Transaction
        const transaction = await Transaction.findOne({ gatewayPayoutId: payoutId, type: 'withdrawal' });
    
        if (!transaction) {
            console.error("Paytm Payouts Callback: Transaction not found for Payout ID:", payoutId);
            return res.status(404).send("Transaction not found.");
        }
    
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            // 3. Update Transaction status
            if (status === 'SUCCESS' && transaction.status === 'pending') {
                transaction.status = 'completed';
                transaction.gatewayTxnId = received_params.txnId; // If provided by Payouts
                transaction.gatewayResponse = received_params;
                await transaction.save({ session });
                console.log(`Wallet withdrawal (Txn: ${transaction._id}) for Payout ID ${payoutId} COMPLETED.`);
                // Balance already deducted. No action needed here.
            } else if (status === 'FAILURE' && transaction.status === 'pending') {
                transaction.status = 'failed';
                transaction.gatewayTxnId = received_params.txnId;
                transaction.gatewayResponse = received_params;
                await transaction.save({ session });
    
                // --- Crucial: Refund balance if withdrawal failed and balance was deducted immediately ---
                const wallet = await Wallet.findOneAndUpdate(
                    { user: transaction.user },
                    { $inc: { balance: transaction.amount } },
                    { new: true, session }
                );
                console.log(`Wallet withdrawal (Txn: ${transaction._id}) FAILED. Balance of ₹${transaction.amount} refunded to wallet.`);
            } else {
                console.warn(`Paytm Payouts Callback: Unhandled status or already processed for Txn ${transaction._id}. Status: ${status}`);
                transaction.gatewayResponse = received_params; // Still save response
                await transaction.save({ session });
            }
    
            await session.commitTransaction();
            session.endSession();
            res.status(200).send('OK'); // Acknowledge webhook
    
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Error processing payouts callback:", error);
            res.status(500).send("Internal Server Error during payouts processing.");
        }
    } catch (error) {
        console.error("Error in Paytm Payouts Callback:", error);
		throw new ApiError(500, "Failed to process Paytm Payouts callback. Please check logs.");
    }
});


// --- Controller to get Wallet History ---
/** * Retrieves the user's wallet transaction history.
 * @desc This endpoint fetches the wallet transaction history for the authenticated user, including deposits, withdrawals, purchases, and refunds.
 * @route GET /wallet/history
 * @access Private (requires user authentication)
 * @param {Object} req - The request object containing user authentication details.
 * @param {Object} res - The response object to send back the result.
 * @returns {Object} - Returns a success response with the user's wallet balance and transaction history.
 * @throws {ApiError} - Throws an error if fetching wallet history fails or if any internal error occurs.
 */
const getWalletHistory = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id;
    
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
    
        const transactions = await Transaction.find({ user: userId })
            .sort({ createdAt: -1 }) // Latest first
            .skip(skip)
            .limit(limit);
    
        const totalTransactions = await Transaction.countDocuments({ user: userId });
    
        const wallet = await Wallet.findOne({ user: userId });
    
        return res
        .status(200)
        .json(new ApiResponse(
            200, {
            balance: wallet ? wallet.balance : 0,
            transactions,
            totalTransactions,
            page,
            pages: Math.ceil(totalTransactions / limit)
        }, "Wallet history retrieved successfully."));
    } catch (error) {
        console.error("Error getting wallet history:", error);
        throw new ApiError(500, "Failed to retrieve wallet history. Please try again later.");
    }
});


// --- Controller to Pay with Wallet (integrates with Checkout logic) ---
const payWithWallet = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { cartId, shippingInfo } = req.body; // Expect shippingInfo and cartId

    if (!shippingInfo || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.pinCode || !shippingInfo.phoneNo) {
        throw new ApiError(400, "Please provide complete shipping information.");
    }
    if (!cartId) {
        throw new ApiError(400, "Cart ID is required to pay with wallet.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Fetch user's cart
        const cart = await Cart.findById(cartId).session(session).populate('products.product');

        if (!cart || cart.user.toString() !== userId.toString() || cart.products.length === 0) {
            throw new ApiError(400, "Invalid cart or cart is empty.");
        }

        // 2. Calculate total amount and check inventory
        let totalAmount = 0;
        const orderProducts = [];
        const productUpdates = [];

        for (const item of cart.products) {
            if (!item.product) {
                throw new ApiError(500, "Product not found for an item in cart.");
            }
            const inventory = await Inventory.findOne({ productId: item.product._id }).session(session);
            if (!inventory || inventory.stock < item.quantity) {
                throw new ApiError(409, `Insufficient stock for ${item.product.name}. Available: ${inventory ? inventory.stock : 0}, Requested: ${item.quantity}.`);
            }
            const { pricePerUnit, totalItemPrice } = calculateItemPrice(item.product, item.quantity);
            totalAmount += totalItemPrice;
            orderProducts.push({
                product: item.product._id,
                name: item.product.name,
                price: pricePerUnit,
                quantity: item.quantity,
                image: item.product.images[0]?.url || 'placeholder_image_url',
            });
            productUpdates.push({
                productId: item.product._id,
                quantity: item.quantity
            });
        }

        // 3. Fetch user's wallet and check balance
        const wallet = await Wallet.findOne({ user: userId }).session(session);
        if (!wallet || wallet.balance < totalAmount) {
            throw new ApiError(400, `Insufficient wallet balance. Required: ₹${totalAmount}, Available: ₹${wallet ? wallet.balance : 0}.`);
        }

        // 4. Create an order in your database
        const order = await Order.create([{
            user: userId,
            products: orderProducts,
            totalAmount: totalAmount,
            tax: 0, // Calculate tax if applicable
            shippingInfo: shippingInfo,
            status: 'processing', // Order processing immediately if paid by wallet
            paymentMethod: 'wallet',
            paymentStatus: 'paid', // Payment is immediate
            shippingCharges: 0, // Calculate shipping charges if applicable
            paidAt: Date.now(),
        }], { session });

        const createdOrder = order[0];

        // 5. Create Transaction for this order payment
        await Transaction.create([{
            user: userId,
            amount: totalAmount,
            type: 'order_payment',
            status: 'completed',
            paymentGateway: 'wallet_internal',
            orderRef: createdOrder._id,
            reason: `Payment for Order ID: ${createdOrder._id} via Wallet`
        }], { session });

        // 6. Deduct from wallet balance
        await Wallet.findOneAndUpdate(
            { user: userId },
            { $inc: { balance: -totalAmount } },
            { new: true, session }
        );

        // 7. Decrement inventory for each product
        for (const update of productUpdates) {
            await Inventory.findOneAndUpdate(
                { productId: update.productId },
                { $inc: { stock: -update.quantity } },
                { new: true, runValidators: true, useFindAndModify: false, session }
            );
        }

        // 8. Clear the user's cart
        await Cart.findOneAndUpdate({ user: userId }, { $set: { products: [] } }, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(new ApiResponse(200, {
            order: createdOrder,
            walletBalance: wallet.balance - totalAmount,
        }, "Payment successful using wallet. Order placed."));

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error during pay with wallet transaction:", error);
        throw new ApiError(500, "Failed to process payment with wallet. Please try again.");
    }
});

export {
    initiateWalletWithdrawal,
    initiateWalletDeposit,
    paytmPayoutsCallback,
    getWalletHistory,
    payWithWallet
}