import mongoose, { Schema } from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js"; // Assuming you have an encryption utility

const walletSchema = new Schema(
    {
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true,
        min: 0
    },
    // paymentMethod: {
    //     type: String,
    //     enum: ['cash', 'card'],
    //     default: 'cash',
    //     required: true
    // },
    // paymentStatus: {
    //     type: String,
    //     enum: ['pending', 'paid', 'failed', 'refunded'],
    //     default: 'pending',
    //     required: true
    // },
    // transactionId: {
    //     type: String,
    //     unique: true,
    //     required: true,
    //     trim: true
    // }
},
    {
    timestamps: true
    }
);

// Pre-save hook to update `updatedAt` for every save
walletSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});


export const Wallet = mongoose.model('Wallet', walletSchema);




const walletTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
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
        enum: ['deposit', 'withdrawal', 'purchase', 'refund_to_wallet'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    paytmOrderId: { type: String, sparse: true },
    paytmTxnId: { type: String, sparse: true },
    paytmPayoutId: { type: String, sparse: true },
    orderRef: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        sparse: true,
    },
    // Withdrawal Details (stored ENCRYPTED)
    // We store them as a single object but fields within will be encrypted strings
    withdrawalDetails: {
        bankAccount: { type: String, sparse: true }, // Will store encrypted string
        ifscCode: { type: String, sparse: true },     // Will store encrypted string
        upiId: { type: String, sparse: true },        // Will store encrypted string
        beneficiaryName: { type: String, sparse: true } // Beneficiary name might not need encryption depending on privacy policy
    },
    reason: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to encrypt sensitive fields if they exist
walletTransactionSchema.pre('save', function (next) {
    if (this.withdrawalDetails) {
        if (this.withdrawalDetails.bankAccount) {
            this.withdrawalDetails.bankAccount = encrypt(this.withdrawalDetails.bankAccount);
        }
        if (this.withdrawalDetails.ifscCode) {
            this.withdrawalDetails.ifscCode = encrypt(this.withdrawalDetails.ifscCode);
        }
        if (this.withdrawalDetails.upiId) {
            this.withdrawalDetails.upiId = encrypt(this.withdrawalDetails.upiId);
        }
        // Beneficiary Name is often considered less sensitive but can be encrypted too if required
        // if (this.withdrawalDetails.beneficiaryName) {
        //     this.withdrawalDetails.beneficiaryName = encrypt(this.withdrawalDetails.beneficiaryName);
        // }
    }
    next();
});

// Post-find hook to decrypt sensitive fields after retrieval
// Use a virtual or a specific method if you only want to decrypt on demand
// For simplicity, here we'll decrypt whenever a document is queried.
walletTransactionSchema.post('findOne', function (doc) {
    if (doc && doc.withdrawalDetails) {
        if (doc.withdrawalDetails.bankAccount) {
            doc.withdrawalDetails.bankAccount = decrypt(doc.withdrawalDetails.bankAccount);
        }
        if (doc.withdrawalDetails.ifscCode) {
            doc.withdrawalDetails.ifscCode = decrypt(doc.withdrawalDetails.ifscCode);
        }
        if (doc.withdrawalDetails.upiId) {
            doc.withdrawalDetails.upiId = decrypt(doc.withdrawalDetails.upiId);
        }
        // if (doc.withdrawalDetails.beneficiaryName) {
        //     doc.withdrawalDetails.beneficiaryName = decrypt(doc.withdrawalDetails.beneficiaryName);
        // }
    }
});

walletTransactionSchema.post('find', function (docs) {
    docs.forEach(doc => {
        if (doc && doc.withdrawalDetails) {
            if (doc.withdrawalDetails.bankAccount) {
                doc.withdrawalDetails.bankAccount = decrypt(doc.withdrawalDetails.bankAccount);
            }
            if (doc.withdrawalDetails.ifscCode) {
                doc.withdrawalDetails.ifscCode = decrypt(doc.withdrawalDetails.ifscCode);
            }
            if (doc.withdrawalDetails.upiId) {
                doc.withdrawalDetails.upiId = decrypt(doc.withdrawalDetails.upiId);
            }
            // if (doc.withdrawalDetails.beneficiaryName) {
            //     doc.withdrawalDetails.beneficiaryName = decrypt(doc.withdrawalDetails.beneficiaryName);
            // }
        }
    });
});



export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);


// Get user consent before storing sensitive data ifsc code, bank account, UPI ID, etc.
// Ensure you have a clear privacy policy and terms of service that users agree to before using wallet functionality.
