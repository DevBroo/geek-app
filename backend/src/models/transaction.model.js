// models/transactionModel.js (This replaces your simpler 'Transaction' and my 'WalletTransaction')
import mongoose, { Schema } from "mongoose";

import { encrypt, decrypt } from "../utils/encryption.js"; // Ensure this utility exists

const transactionSchema = new Schema({
    user: { // Changed from `userId` to `user` for consistency with other models
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    type: { 
        type: String,
        enum: ['deposit', 'withdrawal', 'order_payment', 'refund_to_wallet'], // 'purchase' renamed to 'order_payment' for clarity
        required: true,
    },
    status: { // Status of the transaction itself (e.g., payment gateway status)
        type: String,
        enum: ['pending', 'completed', 'failed', 'refund_initiated', 'refunded'], // Expanded status
        default: 'pending',
    },
    paymentGateway: { // Which gateway/method was used?
        type: String,
        enum: ['paytm_pg', 'paytm_payouts', 'wallet_internal', 'cod'], // 'paytm' split for clarity, 'cod' for cash on delivery
        required: true,
    },

    // References to external payment gateway IDs
    gatewayOrderId: { type: String, sparse: true }, // e.g., Paytm's ORDERID (from initiate transaction)
    gatewayTxnId: { type: String, sparse: true },   // e.g., Paytm's TXNID (from callback)
    gatewayPayoutId: { type: String, sparse: true }, // e.g., Paytm's Payout ID

    // Reference to the related Order document (if type is 'order_payment' or 'refund_to_wallet')
    orderRef: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        sparse: true,
    },
    // Withdrawal Details (stored ENCRYPTED) - only for 'withdrawal' type transactions
    withdrawalDetails: {
        bankAccount: { type: String, sparse: true }, // Will store encrypted string
        ifscCode: { type: String, sparse: true },     // Will store encrypted string
        upiId: { type: String, sparse: true },        // Will store encrypted string
        beneficiaryName: { type: String, sparse: true } // Beneficiary name might not need encryption depending on privacy policy
    },
    reason: { // A brief description of the transaction
        type: String,
        required: false,
    },
    // Store full gateway response for debugging/audit (optional)
    gatewayResponse: {
        type: Object,
        sparse: true,
    },
},{
    timestamps: true 
});

// Pre-save hook to encrypt sensitive fields if they exist
transactionSchema.pre('save', function (next) {
    if (this.withdrawalDetails) {
        if (this.withdrawalDetails.bankAccount && !this.withdrawalDetails.bankAccount.includes(':')) { // Check if already encrypted
            this.withdrawalDetails.bankAccount = encrypt(this.withdrawalDetails.bankAccount);
        }
        if (this.withdrawalDetails.ifscCode && !this.withdrawalDetails.ifscCode.includes(':')) {
            this.withdrawalDetails.ifscCode = encrypt(this.withdrawalDetails.ifscCode);
        }
        if (this.withdrawalDetails.upiId && !this.withdrawalDetails.upiId.includes(':')) {
            this.withdrawalDetails.upiId = encrypt(this.withdrawalDetails.upiId);
        }
    }
    next();
});

// Post-find hook to decrypt sensitive fields after retrieval
transactionSchema.post('findOne', function (doc) {
    if (doc && doc.withdrawalDetails) {
        if (doc.withdrawalDetails.bankAccount && doc.withdrawalDetails.bankAccount.includes(':')) {
            doc.withdrawalDetails.bankAccount = decrypt(doc.withdrawalDetails.bankAccount);
        }
        if (doc.withdrawalDetails.ifscCode && doc.withdrawalDetails.ifscCode.includes(':')) {
            doc.withdrawalDetails.ifscCode = decrypt(doc.withdrawalDetails.ifscCode);
        }
        if (doc.withdrawalDetails.upiId && doc.withdrawalDetails.upiId.includes(':')) {
            doc.withdrawalDetails.upiId = decrypt(doc.withdrawalDetails.upiId);
        }
    }
});

transactionSchema.post('find', function (docs) {
    docs.forEach(doc => {
        if (doc && doc.withdrawalDetails) {
            if (doc.withdrawalDetails.bankAccount && doc.withdrawalDetails.bankAccount.includes(':')) {
                doc.withdrawalDetails.bankAccount = decrypt(doc.withdrawalDetails.bankAccount);
            }
            if (doc.withdrawalDetails.ifscCode && doc.withdrawalDetails.ifscCode.includes(':')) {
                doc.withdrawalDetails.ifscCode = decrypt(doc.withdrawalDetails.ifscCode);
            }
            if (doc.withdrawalDetails.upiId && doc.withdrawalDetails.upiId.includes(':')) {
                doc.withdrawalDetails.upiId = decrypt(doc.withdrawalDetails.upiId);
            }
        }
    });
});

export const Transaction = mongoose.model("Transaction", transactionSchema); // Export as 'Transaction'