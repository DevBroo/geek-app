import mongoose, { Schema, Document } from "mongoose";
import { type } from "os";

// const orderSchema = new Schema(
//     {
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             required: [true, "user id is require"],
//             ref: "User",
//         },
//         products: [
//             {
//                 name: {
//                     type: String,
//                     required: [true, "product name is require"],
//                 },
//                 price: {
//                     type: Number,
//                     required: [true, "product price is require"],
//                 },
//                 quantity: {
//                     type: Number,
//                     required: [true, "product quantity is require"],
//                 },
//                 image: {
//                     type: String,
//                     required: [true, "product image is require"],
//                 },
//                 product: {
//                     type: mongoose.Schema.Types.ObjectId,
//                     ref: "Products",
//                     required: true,
//                 },
//             },
//         ],
//         totalAmount: {
//             type: Number,
//             required: true,
//         },
//         tax: {
//             type: Number,
//             default: 0,
//             required: true,
//         },
//         paytmOrderId: { type: String, sparse: true },
//         paytmTxnId: { type: String, sparse: true },
//         address: [
//             {
//                 type: Schema.Types.ObjectId,
//                 ref: "Address",
//                 required: true
//             }
//         ],
//         status: {
//             type: String,
//             default: "pending",
//             enum: ["pending", "processing", "shipped", "delivered"],
//             required: true
//         },
//         paymentMethod: {
//             type: String,
//             enum: ["credit_card", "debit_card", "net_banking", "upi", "cod"],
//             default: "upi",
//             required: true
//         },
//         paymentStatus: {
//             type: String,
//             default: "pending",
//             enum: ["pending", "paid", "failed", "refunded"],
//             required: true
//         },
//         shippingCharges: {
//             type: Number,
//             default: 0,
//             required: true,
//         },
//         deliveryDate: {
//             type: Date,
//             default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Set the default value to three days from now
//             required: true
//         },
//         paidAt: Date,
//         returnedAt: Date,
//         returnedReason: {
//             type: String,
//             default: ''
//         },

//     },
//     {
//         timestamps: true,
//     }
// );


const orderSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "User ID is required"],
            ref: "User", // Refers to your User model
        },
        products: [
            {
                product: { // Reference to the actual Product document
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product", // Refers to your Product model
                    required: true,
                },
                name: { type: String, required: [true, "Product name is required"], },
                price: { type: Number, required: [true, "Product price is required"], }, // Price per unit at purchase time
                quantity: { type: Number, required: [true, "Product quantity is required"], },
                image: { type: String, required: [true, "Product image is required"], }, // Main image URL
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        tax: {
            type: Number,
            default: 0,
            required: true,
        },
        // Shipping Information (as a nested object)
        shippingInfo: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pinCode: { type: String, required: true },
            phoneNo: { type: String, required: true },
        },
        // Order Fulfillment Status
        status: {
            type: String,
            default: "pending",
            enum: ["pending", "processing", "shipped", "delivered", "returned", "cancelled"], // Updated enum
            required: true
        },
        // Payment Gateway specific identifiers for this order
        paytmOrderId: { 
            type: String, 
            sparse: true 
        }, // Your internal order ID used with Paytm
        paytmTxnId: { 
            type: String, 
            sparse: true 
        },   // Paytm's transaction ID for this order
        // You might add paytmResponse: { type: Object, sparse: true } here if you want to store the full response

        paymentMethod: {
            type: String,
            enum: ["credit_card", "debit_card", "net_banking", "upi", "cod", "wallet", "paytm_wallet"], // Expanded enum
            default: "upi",
            required: true
        },
        paymentStatus: { // Payment transaction status for this order
            type: String,
            default: "pending",
            enum: ["pending", "paid", "failed", "refund_initiated", "refunded"], // Added 'refund_initiated'
            required: true
        },
        shippingCharges: {
            type: Number,
            default: 0,
            required: true,
        },
        deliveryDate: {
            type: Date,
            default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default to three days from now
            required: true
        },
        paidAt: Date, // Timestamp when payment was successfully processed
        deliveredAt: Date, // Timestamp when order was delivered
        returnedAt: Date,
        returnedReason: {
            type: String,
            default: ''
        },
    },
    {
        timestamps: true, // `createdAt` and `updatedAt`
    }
);


export const Order = mongoose.model("Order", orderSchema);