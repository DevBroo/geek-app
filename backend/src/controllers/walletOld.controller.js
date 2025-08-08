// controllers/walletController.js

import {User} from '../models/user.model.js';
import {Wallet} from '../models/wallet.model.js';
import {WalletTransaction} from '../models/wallet.model.js';
import {Order} from '../models/orders.model.js'; // Your main Order model
import {Product} from '../models/products.model.js'; // For inventory check during purchase
import {Cart} from '../models/cart.model.js'; // For clearing cart after purchase
import {Inventory} from '../models/inventory.model.js'; // For inventory check during purchase
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import PaytmChecksum from 'paytmchecksum';
import https from 'https'; // For Paytm API calls


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
    CLIENT_ID: process.env.PAYTM_PAYOUTS_CLIENT_ID, // Might not be needed for basic Payouts
    WEBSITE: process.env.PAYTM_PAYOUTS_WEBSITE,
    // Note: Payouts URLs might be different. Check Paytm Payouts API documentation.
    BASE_URL: process.env.PAYTM_PAYOUTS_ENV === "PRODUCTION"
        ? "https://dashboard.paytm.com" // Payouts often uses dashboard API endpoints
        : "https://dashboard.paytm.com/next/console/APIDetails" // Placeholder, get actual from docs
    // Example Payouts URL for initiateTransfer: https://trust.paytm.in/wallet/custody/v1/process
    // This needs to be precisely from the Paytm Payouts docs for your account type.
};


// --- Controller for initiating a DEPOSIT to Wallet ---
/**
 * Initiates a deposit to the user's wallet using Paytm Payment Gateway.
 * @desc This endpoint allows users to deposit funds into their wallet.
 * @route POST /wallet/deposit
 * @access Private (requires user authentication) 
 * @param {Object} req - The request object containing deposit details.
 * @param {Object} res - The response object to send back the result.
 * @body {Object} req.body - Contains the deposit amount.
 * @body {number} req.body.amount - The amount to deposit (must be a positive number).
 * * @returns {Object} - Returns a success response with the Paytm transaction token and wallet transaction ID.
 * * @throws {ApiError} - Throws an error if deposit amount is invalid, wallet transaction creation fails, or Paytm API call fails.
 */
const initiateWalletDeposit = asyncHandler(async (req, res, next) => {
    try {
		const { amount } = req.body;
		    const userId = req.user._id;
			if(!userId || !userId.toString()) {
		        throw new ApiError(400, "User ID missing.");
			}
		
		    if (typeof amount !== 'number' || amount <= 0) {
		        throw new ApiError(400, "Deposit amount must be a positive number.");
		    }
		
		    // 1. Ensure user has a wallet, create if not
		    let wallet = await Wallet.findOne({ user: userId });
		    if (!wallet) {
		        wallet = await Wallet.create({ user: userId, balance: 0 });
		    }
		
		    // 2. Create a pending WalletTransaction record
		    const walletTxn = await WalletTransaction.create({
		        user: userId,
		        amount: amount,
		        type: 'deposit',
		        status: 'pending',
		        paymentGateway: 'paytm',
		        reason: `Deposit of ₹${amount} to wallet`
		    });
		
		    if (!walletTxn) {
		        throw new ApiError(500, "Failed to create wallet transaction record.");
		    }
		
		    // 3. Prepare parameters for Paytm Payment Gateway (acting as a deposit mechanism)
		    const paytmParams = {
		        body: {
		            requestType: "Payment",
		            mid: PAYTM_PG_CONFIG.MID,
		            websiteName: PAYTM_PG_CONFIG.WEBSITE,
		            orderId: walletTxn._id.toString(), // Use wallet transaction ID as Paytm's ORDER_ID
		            txnAmount: {
		                value: amount.toFixed(2),
		                currency: "INR",
		            },
		            userInfo: {
		                custId: userId.toString(),
		            },
		            // The callbackUrl for the client-side redirect after payment.
		            // This will be handled by our existing `paytmCallback` from previous section
		            callbackUrl: `${PAYTM_PG_CONFIG.CALLBACK_URL}?walletTxnId=${walletTxn._id.toString()}`,
		            // Add other parameters like CHANNEL_ID, INDUSTRY_TYPE_ID if needed for specific use cases
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
		            path: '/theia/api/v1/initiateTransaction?mid=' + PAYTM_PG_CONFIG.MID + '&orderId=' + walletTxn._id.toString(),
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
		        console.error("Paytm Deposit Initiate Transaction API Error:", paytmResponse);
		        walletTxn.status = 'failed';
		        await walletTxn.save();
		        throw new ApiError(500, paytmResponse.body.resultInfo?.resultMsg || "Failed to initiate deposit with Paytm.");
		    }
		
		    // 6. Update wallet transaction with Paytm token
		    walletTxn.paytmOrderId = paytmResponse.body.orderId; // Paytm's internal orderId, though we used walletTxn._id as ours
		    walletTxn.paytmTxnId = paytmResponse.body.txnToken; // Store token here for linking
		    await walletTxn.save();
		
		    // 7. Send details to frontend for payment
		    return res
			.status(200)
			.json(new ApiResponse(200, {
		        walletTxnId: walletTxn._id, // Your internal wallet transaction ID
		        mid: PAYTM_PG_CONFIG.MID,
		        txnToken: paytmResponse.body.txnToken,
		        amount: amount.toFixed(2),
		        callbackUrl: `${PAYTM_PG_CONFIG.CALLBACK_URL}?walletTxnId=${walletTxn._id.toString()}`,
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
 * Initiates a withdrawal from the user's wallet.
 * @desc This endpoint allows users to withdraw funds from their wallet to a bank account or UPI ID.
 * @route POST /wallet/withdraw
 * @access Private (requires user authentication)
 * @param {Object} req - The request object containing withdrawal details.
 * @param {Object} res - The response object to send back the result.
 * @body {Object} req.body - Contains the withdrawal amount and details.
 * @body {number} req.body.amount - The amount to withdraw (must be a positive number).
 * @body {Object} req.body.withdrawalDetails - Contains bank account/UPI details
 * @body {string} req.body.withdrawalDetails.bankAccount - The bank account number (optional).
 * @body {string} req.body.withdrawalDetails.ifscCode - The IFSC code for the bank account (optional).
 * @body {string} req.body.withdrawalDetails.upiId - The UPI ID to withdraw to (optional).
 * @body {string} req.body.withdrawalDetails.beneficiaryName - The name of the beneficiary (required).
 * * @returns {Object} - Returns a success response with the wallet transaction ID and current balance.
 */
const initiateWalletWithdrawal = asyncHandler(async (req, res ) => {
		try {
			const { amount, withdrawalDetails } = req.body; // withdrawalDetails: { bankAccount, ifscCode, upiId, beneficiaryName }
			const userId = req.user._id;

		if (typeof userId !== 'string' || !userId) {
			throw new ApiError(400, "User ID missing.");
		}
	
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
	
	    // 3. Create a pending WalletTransaction record for withdrawal
	    const walletTxn = await WalletTransaction.create({
	        user: userId,
	        amount: amount,
	        type: 'withdrawal',
	        status: 'pending',
	        paymentGateway: 'paytm', // Payouts are part of Paytm
	        reason: `Withdrawal of ₹${amount} from wallet`,
	        withdrawalDetails: { //This object will be stored encrypted in database for security in pre-save hook
	            // Ensure these fields are trimmed and sanitized before storing in db. 
	            bankAccount: withdrawalDetails.bankAccount || null,
	            ifscCode: withdrawalDetails.ifscCode || null,
	            upiId: withdrawalDetails.upiId || null,
	            beneficiaryName: withdrawalDetails.beneficiaryName.trim()
	        }
	    });
	
	    if (!walletTxn) {
	        throw new ApiError(500, "Failed to create withdrawal transaction record.");
	    }
	
	    // 4. Prepare parameters for Paytm Payouts API
	    // IMPORTANT: The actual API endpoint and request structure for Payouts
	    // vary based on Paytm's latest documentation and your specific Payouts account.
	    // The details below are illustrative. YOU MUST REFER TO PAYTM PAYOUTS API DOCS.
	    let paytmPayoutsParams;
	    let payoutsApiPath;
	
	    if (withdrawalDetails.upiId) {
	        // Example for UPI Payouts
	        paytmPayoutsParams = {
	            requestGuid: walletTxn._id.toString(), // Unique request ID
	            // ... other common parameters like MID
	            // Specific for UPI:
	            payeeAccount: withdrawalDetails.upiId,
	            payeeVPA: withdrawalDetails.upiId, // Often same as payeeAccount for UPI
	            amount: amount.toFixed(2),
	            purpose: "Withdrawal from Wallet",
	            callbackUrl: PAYTM_PAYOUTS_CONFIG.PAYOUTS_CALLBACK_URL, // Specific Payouts webhook
	            // ... more params
	        };
	        payoutsApiPath = '/payout/v1/disburse/upi'; // Illustrative path
	
	    } else if (withdrawalDetails.bankAccount && withdrawalDetails.ifscCode) {
	        // Example for Bank Account Payouts (NEFT/IMPS)
	        paytmPayoutsParams = {
	            requestGuid: walletTxn._id.toString(),
	            // ... common params
	            // Specific for Bank Account:
	            payeeAccount: withdrawalDetails.bankAccount,
	            ifsc: withdrawalDetails.ifscCode,
	            amount: amount.toFixed(2),
	            purpose: "Withdrawal from Wallet",
	            callbackUrl: PAYTM_PAYOUTS_CONFIG.PAYOUTS_CALLBACK_URL,
	            // ... more params
	        };
	        payoutsApiPath = '/payout/v1/disburse/bank'; // Illustrative path
	    } else {
	        throw new ApiError(400, "Invalid withdrawal details provided.");
	    }
	
	    // Common Paytm Payouts parameters (add to paytmPayoutsParams)
	    const commonPayoutsParams = {
	        mid: PAYTM_PAYOUTS_CONFIG.MID,
	        // ... more params like businessType, etc.
	    };
	    Object.assign(paytmPayoutsParams, commonPayoutsParams);
	
	    // 5. Generate Checksum for Payouts request
	    const checksum = await PaytmChecksum.generateSignature(
	        JSON.stringify(paytmPayoutsParams),
	        PAYTM_PAYOUTS_CONFIG.MERCHANT_KEY
	    );
	
	    // 6. Call Paytm Payouts API
	    const post_data = JSON.stringify(paytmPayoutsParams);
	    const payoutsResponse = await new Promise((resolve, reject) => {
	        const options = {
	            hostname: new URL(PAYTM_PAYOUTS_CONFIG.BASE_URL).hostname,
	            port: 443,
	            path: payoutsApiPath, // Use the correct path for UPI or Bank payouts
	            method: 'POST',
	            headers: {
	                'Content-Type': 'application/json',
	                'Content-Length': post_data.length,
	                'x-checksum': checksum, // For Payouts, checksum is often in header
	                // Other headers like Authorization if needed for Payouts
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
	
	    if (!payoutsResponse || payoutsResponse.status !== 'SUCCESS') {
	        console.error("Paytm Payouts API Error:", payoutsResponse);
	        walletTxn.status = 'failed';
	        await walletTxn.save();
	        throw new ApiError(500, payoutsResponse.statusMessage || "Failed to initiate withdrawal with Paytm.");
	    }
	
	    // 7. Update wallet transaction with Paytm Payout ID
	    walletTxn.paytmPayoutId = payoutsResponse.payoutId || payoutsResponse.id; // Get ID from response
	    await walletTxn.save();
	
	    // 8. Deduct balance immediately (or after webhook confirmation for high-risk scenarios)
	    // For most cases, deduct balance now and reverse on webhook if failed.
	    wallet.balance -= amount;
	    await wallet.save();
	
	    return res
		.status(200)
		.json(new ApiResponse(200, {
				walletTxnId: walletTxn._id,
				currentBalance: wallet.balance,
				paytmPayoutId: walletTxn.paytmPayoutId,
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
		    // You might need to reconstruct the request body and verify against the provided hash.
		    // Refer to Paytm Payouts webhook documentation for exact checksum verification.
		    // For simplicity, I'm using the PG checksum method here, but confirm for Payouts.
		    const isVerifySignature = PaytmChecksum.verifySignature(
		        received_params, // Or a subset of params used for hash generation
		        PAYTM_PAYOUTS_CONFIG.MERCHANT_KEY,
		        checksumHash
		    );
		
		    if (!isVerifySignature) {
		        console.error('Paytm Payouts Callback: Checksum verification failed for Payout ID:', payoutId);
		        return res.status(400).send("Invalid signature.");
		    }
		
		    // 2. Find the corresponding WalletTransaction
		    const walletTxn = await WalletTransaction.findOne({ paytmPayoutId: payoutId, type: 'withdrawal' });
		
		    if (!walletTxn) {
		        console.error("Paytm Payouts Callback: Wallet transaction not found for Payout ID:", payoutId);
		        return res.status(404).send("Transaction not found.");
		    }
		
		    // 3. Update WalletTransaction status
		    if (status === 'SUCCESS' && walletTxn.status === 'pending') {
		        walletTxn.status = 'completed';
		        walletTxn.paytmTxnId = received_params.txnId; // If provided
		        await walletTxn.save();
		        console.log(`Wallet withdrawal (Txn: ${walletTxn._id}) for Payout ID ${payoutId} COMPLETED.`);
		        // Balance already deducted. No action needed here.
		    } else if (status === 'FAILURE' && walletTxn.status === 'pending') {
		        walletTxn.status = 'failed';
		        walletTxn.paytmTxnId = received_params.txnId;
		        await walletTxn.save();
		
		        // --- Crucial: Refund balance if withdrawal failed and balance was deducted immediately ---
		        const wallet = await Wallet.findOne({ user: walletTxn.user });
		        if (wallet) {
		            wallet.balance += walletTxn.amount; // Add money back to wallet
		            await wallet.save();
		            console.log(`Wallet withdrawal (Txn: ${walletTxn._id}) FAILED. Balance of ₹${walletTxn.amount} refunded to wallet.`);
		        }
		    } else {
		        console.warn(`Paytm Payouts Callback: Unhandled status or already processed for Txn ${walletTxn._id}. Status: ${status}`);
		    }
		
		    return res.status(200).send('OK'); // Acknowledge webhook
	} catch (error) {
		console.error("Error in Paytm Payouts Callback:", error);
		throw new ApiError(500, "Failed to process Paytm Payouts callback. Please check logs.");
		
	}
});


// --- Modified Paytm Callback for Payments (DEPOSITS & PURCHASES) ---
// Extend the existing `paytmCallback` from your previous payment setup
// to handle both product purchases AND wallet deposits.
// We'll use a query parameter to differentiate.
/** * Handles Paytm Payment Gateway callbacks for both product purchases and wallet deposits. 
 * @desc This endpoint processes the callback from Paytm after a payment is made, updating the order or wallet transaction status accordingly.
 * * @route POST /payment/callback
 * * @access Public (no authentication required) 
 * @param {Object} req - The request object containing the Paytm callback payload.
 * @param {Object} res - The response object to send back the result.
 * * @body {Object} req.body - Contains the Paytm callback data.
 * * @body {string} req.body.ORDERID - The Paytm order ID (can be your internal Order ID or WalletTransaction ID).
 * * @body {string} req.body.CHECKSUMHASH - The checksum hash for signature verification.
 * * @body {string} req.body.STATUS - The status of the transaction (e.g., 'TXN_SUCCESS', 'TXN_FAILURE', 'PENDING').
 * * @query {string} req.query.walletTxnId - Optional query parameter to identify if this is a wallet deposit callback.
 * * @returns {Object} - Returns a success response with the order or wallet transaction status.
 * * @throws {ApiError} - Throws an error if checksum verification fails, order or wallet transaction not found, or any processing error occurs.
 * * @note This endpoint should be publicly accessible without authentication, as Paytm will call it directly.
 * * @note Ensure that your frontend handles the response correctly, especially for wallet deposits.
 * * @note This callback should be idempotent, meaning multiple calls with the same data should have no side effects beyond the initial one.
 * * @note In production, ensure that this endpoint is secure and cannot be accessed directly by unauthorized parties.
 * */
const paytmCallback = asyncHandler(async (req, res, next) => {
    try {
		const received_params = req.body;
		    console.log("Paytm Callback received:", received_params);
		
		    const orderId = received_params.ORDERID; // This will be your internal Order ID OR WalletTransaction ID
		    const paytmChecksum = received_params.CHECKSUMHASH;
		    const walletTxnIdFromQuery = req.query.walletTxnId; // Check for query parameter
		
		    const isVerifySignature = PaytmChecksum.verifySignature(
		        received_params,
		        PAYTM_PG_CONFIG.MERCHANT_KEY,
		        paytmChecksum
		    );
		
		    if (!isVerifySignature) {
		        console.error('Paytm Callback: Checksum verification failed for ID:', orderId);
		        // Depending on your frontend, you might redirect to a generic error page
		        return res.status(400).send("Invalid signature.");
		    }
		
		    const paytmTransactionStatus = received_params.STATUS;
		
		    // --- Handle Wallet Deposit Callback ---
		    if (walletTxnIdFromQuery) {
		        const walletTxn = await WalletTransaction.findById(walletTxnIdFromQuery);
		
		        if (!walletTxn) {
		            console.error("Paytm Callback (Deposit): Wallet transaction not found for ID:", walletTxnIdFromQuery);
		            return res.status(404).send("Wallet Transaction not found.");
		        }
		
		        if (paytmTransactionStatus === 'TXN_SUCCESS' && walletTxn.status === 'pending') {
		            walletTxn.paytmTxnId = received_params.TXNID;
		            walletTxn.status = 'completed';
		            walletTxn.paymentGateway = 'paytm'; // Confirm payment gateway used
		
		            // --- Increment Wallet Balance ---
		            const wallet = await Wallet.findOneAndUpdate(
		                { user: walletTxn.user },
		                { $inc: { balance: walletTxn.amount } },
		                { new: true, upsert: true } // Create wallet if it doesn't exist
		            );
		            await walletTxn.save();
		            console.log(`Wallet Deposit (Txn: ${walletTxn._id}) COMPLETED. Wallet balance updated for user ${walletTxn.user}.`);
		
		            // You might redirect the user back to the wallet page in the frontend app
		            // res.redirect(`YOUR_FRONTEND_APP_URL/wallet?status=success&txId=${walletTxn._id}`);
		
		        } else if (paytmTransactionStatus === 'TXN_FAILURE' && walletTxn.status === 'pending') {
		            walletTxn.status = 'failed';
		            walletTxn.paytmTxnId = received_params.TXNID;
		            await walletTxn.save();
		            console.log(`Wallet Deposit (Txn: ${walletTxn._id}) FAILED.`);
		            // res.redirect(`YOUR_FRONTEND_APP_URL/wallet?status=failed&txId=${walletTxn._id}`);
		
		        } else if (paytmTransactionStatus === 'PENDING' && walletTxn.status === 'pending') {
		             // Keep status as pending, the client can poll for final status
		            console.log(`Wallet Deposit (Txn: ${walletTxn._id}) is PENDING.`);
		            // res.redirect(`YOUR_FRONTEND_APP_URL/wallet?status=pending&txId=${walletTxn._id}`);
		        } else {
		            console.warn(`Wallet Deposit (Txn: ${walletTxn._id}): Unhandled status or already processed: ${paytmTransactionStatus}.`);
		        }
		        // Send a generic response. The frontend will poll your /wallet/transactions or /order/status endpoint
		        return res.status(200).json({ status: 'ok', message: `Wallet deposit status for transaction ${walletTxnIdFromQuery} processed.` });
		    }
		
		    // --- Handle Product Purchase Callback (Existing Logic) ---
		    // If it's not a wallet deposit, assume it's a product purchase order.
		    // This is the SAME LOGIC as your existing `paytmCallback` from the previous step.
		    const order = await Order.findOne({ paytmOrderId: orderId });
		
		    if (!order) {
		        console.error("Paytm Callback (Purchase): Order not found in DB for Order ID:", orderId);
		        return res.status(404).send("Order not found.");
		    }
		
		    let appPaymentStatus = 'failed';
		
		    if (paytmTransactionStatus === 'TXN_SUCCESS') {
		        appPaymentStatus = 'paid';
		        if (order.paymentStatus === 'pending') {
		            order.paytmTxnId = received_params.TXNID;
		            order.paytmPaymentStatus = paytmTransactionStatus;
		            order.paymentStatus = appPaymentStatus;
		            order.paymentMethod = received_params.PAYMENTMODE || 'unknown';
		
		            // Decrement inventory stock for each product in the order
		            for (const item of order.products) {
		                await Inventory.findOneAndUpdate(
		                    { productId: item.product },
		                    { $inc: { stock: -item.quantity } },
		                    { new: true }
		                );
		            }
		            // Clear the user's cart after successful payment
		            await Cart.findOneAndUpdate({ user: order.user }, { $set: { products: [] } });
		            await order.save();
		            console.log(`Order ${order._id} (Paytm ID: ${orderId}) marked as PAID. Inventory updated. Cart cleared.`);
		        } else {
		            console.warn(`Order ${order._id} (Paytm ID: ${orderId}) already processed or in unexpected state: ${order.paymentStatus}. Skipping inventory update.`);
		        }
		    } else if (paytmTransactionStatus === 'PENDING') {
		        appPaymentStatus = 'pending';
		        order.paymentStatus = appPaymentStatus;
		        console.log(`Order ${order._id} (Paytm ID: ${orderId}) is PENDING.`);
		    } else {
		        appPaymentStatus = 'failed';
		        order.paymentStatus = appPaymentStatus;
		        console.log(`Order ${order._id} (Paytm ID: ${orderId}) FAILED. Status: ${paytmTransactionStatus}`);
		    }
		    order.paytmResponse = received_params;
		    await order.save();
		
		    // Send generic response, frontend will poll
		    return res.status(200).json({ status: 'ok', message: `Order status for order ${orderId} processed.` });

	} catch (error) {
		console.error("Error in Paytm Callback:", error);
		throw new ApiError(500, "Failed to process Paytm callback. Please check logs.");
		
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
const getWalletHistory = asyncHandler(async (req, res ) => {
    try {
		const userId = req.user._id;

		if (typeof userId !== 'string' || !userId) {
			throw new ApiError(400, "User ID missing.");
		}
		
		    // Optional: add pagination and filtering
		    const page = parseInt(req.query.page) || 1;
		    const limit = parseInt(req.query.limit) || 10;
		    const skip = (page - 1) * limit;
		
		    const transactions = await WalletTransaction.find({ user: userId })
		        .sort({ createdAt: -1 }) // Latest first
		        .skip(skip)
		        .limit(limit);
			// When `transactions` are returned, the post-find hook on WalletTransaction model
   	 		// will automatically decrypt the `withdrawalDetails` fields before they are sent in the API response.
		
		    const totalTransactions = await WalletTransaction.countDocuments({ user: userId });
			
			if (totalTransactions === 0) {
				throw new ApiError(404, "No wallet transactions found for this user.");
			}
		
		    const wallet = await Wallet.findOne({ user: userId });

			if (!wallet) {
				throw new ApiError(404, "Wallet not found for this user.");
			}
		    return res.status(200).json(new ApiResponse(200, {
		        balance: wallet ? wallet.balance : 0,
		        transactions,
		        totalTransactions,
		        page,
		        pages: Math.ceil(totalTransactions / limit)
		    }, "Wallet history retrieved successfully."));

	} catch (error) {
		console.error("Error fetching wallet history:", error);
		throw new ApiError(500, "Failed to fetch wallet history. Please try again later.");
		
	}
});



// --- Controller to Pay with Wallet (integrates with Checkout logic) ---
/**
 * Handles payment using the user's wallet balance.
 * @desc This endpoint allows users to pay for their cart using their wallet balance.
 * * @route POST /wallet/pay
 * * @access Private (requires user authentication)
 * @param {Object} req - The request object containing cart details.
 * @param {Object} res - The response object to send back the result.
 * * @body {Object} req.body - Contains the cart ID to process payment.
 * @body {string} req.body.cartId - The ID of the user's cart to be processed.
 * * @returns {Object} - Returns a success response with the order details, updated wallet balance, and wallet transaction details.
 * * @throws {ApiError} - Throws an error if cart is invalid, insufficient wallet balance, or any processing error occurs.
 */
const payWithWallet = asyncHandler(async (req, res ) => {
    const userId = req.user._id;
    const { cartId } = req.body;

	if( typeof userId !== 'string' || !userId) {
		throw new ApiError(400, "User ID missing.");
	}

    // Start a Mongoose session
    const session = await mongoose.startSession();
    session.startTransaction(); // Start the transaction

    try {
        // 1. Fetch user's cart (within the session)
        const cart = await Cart.findById(cartId).session(session).populate('products.product');

        if (!cart || cart.user.toString() !== userId.toString() || cart.products.length === 0) {
            throw new ApiError(400, "Invalid cart or cart is empty.");
        }

        // 2. Calculate total amount and check inventory (within the session)
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
            totalAmount += item.product.price * item.quantity;
            orderProducts.push({
                product: item.product._id,
                quantity: item.quantity,
                priceAtPurchase: item.product.price
            });
            productUpdates.push({
                productId: item.product._id,
                quantity: item.quantity
            });
        }

        // 3. Fetch user's wallet and check balance (within the session)
        const wallet = await Wallet.findOne({ user: userId }).session(session);
        if (!wallet || wallet.balance < totalAmount) {
            throw new ApiError(400, `Insufficient wallet balance. Required: ₹${totalAmount}, Available: ₹${wallet ? wallet.balance : 0}.`);
        }

        // 4. Create an order in your database (within the session)
        const order = await Order.create([{
            user: userId,
            products: orderProducts,
            totalAmount: totalAmount,
            paymentStatus: 'paid',
            paymentMethod: 'wallet',
            paytmOrderId: `wallet_order_${Date.now()}_${userId.toString().slice(-5)}`,
        }], { session }); // Pass session to create

        // Access the created order from the array
        const createdOrder = order[0];

        // 5. Create WalletTransaction for purchase (within the session)
        const walletTxn = await WalletTransaction.create([{
            user: userId,
            amount: totalAmount,
            type: 'purchase',
            status: 'completed',
            paymentGateway: 'wallet_internal',
            orderRef: createdOrder._id,
            reason: `Purchase for Order ID: ${createdOrder._id}`
        }], { session }); // Pass session to create

        // Access the created wallet transaction from the array
        const createdWalletTxn = walletTxn[0];

        // 6. Deduct from wallet balance (within the session)
        await Wallet.findOneAndUpdate(
            { user: userId },
            { $inc: { balance: -totalAmount } },
            { new: true, session } // Pass session to update
        );

        // 7. Decrement inventory for each product (within the session)
        for (const update of productUpdates) {
            await Inventory.findOneAndUpdate(
                { productId: update.productId },
                { $inc: { stock: -update.quantity } },
                { new: true, runValidators: true, useFindAndModify: false, session } // Pass session
            );
        }

        // 8. Clear the user's cart (within the session)
        await Cart.findOneAndUpdate({ user: userId }, { $set: { products: [] } }, { session });

        await session.commitTransaction(); // Commit all changes if everything succeeded
        session.endSession(); // End the session

        return res
		.status(200)
		.json(new ApiResponse(200, {
            order: createdOrder,
            walletBalance: wallet.balance - totalAmount, // Show updated balance
            walletTransaction: createdWalletTxn
        }, "Payment successful using wallet. Order placed."));

    } catch (error) {
        await session.abortTransaction(); // Rollback all changes if any error occurred
        session.endSession(); // End the session

        console.error("Error during pay with wallet transaction:", error);
        throw new ApiError(500, "Failed to complete payment. Please try again."); // Re-throw the error to be caught by your global error handler
    }
});



// --- Controller to Fetch User Wallet ---
/** * Retrieves the user's wallet details.
 * @desc This endpoint fetches the wallet details for the authenticated user, including current balance and transaction history.
 * @route GET /wallet
 * @access Private (requires user authentication)
 * @param {Object} req - The request object containing user authentication details.
 * @param {Object} res - The response object to send back the result.
 * @returns {Object} - Returns a success response with the user's wallet balance and transaction history.
 * @throws {ApiError} - Throws an error if fetching wallet details fails or if any internal error occurs.
 */
const fetchUserWallet = asyncHandler(async (req, res ) => {
	try {
		const userId = req.user._id;
		
		    // Fetch user's wallet
		    const wallet = await Wallet.findOne({ user: userId });
		    if (!wallet) {
		        throw new ApiError(404, "Wallet not found for this user.");
		    }
		
		    // Fetch recent transactions (optional: add pagination)
		    const transactions = await WalletTransaction.find({ user: userId })
		        .sort({ createdAt: -1 }) // Latest first
		        .limit(10); // Adjust limit as needed
		
		    return res.status(200).json(new ApiResponse(200, {
		        balance: wallet.balance,
		        transactions
		    }, "User wallet details retrieved successfully."));

	} catch (error) {
		console.error("Error fetching user wallet:", error);
		throw new ApiError(500, "Failed to fetch user wallet. Please try again later.");
		
	}
});


// Export all controllers
export {
	paytmCallback,
	getWalletHistory,
	payWithWallet,
	paytmPayoutsCallback,
	initiateWalletDeposit,
	initiateWalletWithdrawal,
	fetchUserWallet
};