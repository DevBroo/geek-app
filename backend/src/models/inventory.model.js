import mongoose, { Schema } from 'mongoose';

const inventorySchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: false,
        required: true
    },
    warehouseLocation: {
        type: String,
        required: true,
        trim: true,
        default: ''
    },

},
    {
        timestamps: true
    }
);

export const Inventory = mongoose.model('Inventory', inventorySchema);