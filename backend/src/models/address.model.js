import mongoose, { Schema } from 'mongoose';

const addressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    addressType: {
        type: String,
        enum: ['Shipping', 'Billing', 'Both'],
        required: true,
        default: 'Both',
        trim: true
    },
    isBoth: {
        type: Boolean,
        default: false,
        required: true
    },
    billingAddress: {
        type: String,
        required: true,
        trim: true
    },
    shippingAddress: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    landmark: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    pinCode: {
        type: Number,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        enum: ['India', 'USA', 'Canada', 'UK', 'Australia', 'Other'],
        required: true,
        trim: true
    }
    
},
    {
        timestamps: true,
    }
)

export const Address = mongoose.model('Address', addressSchema);
