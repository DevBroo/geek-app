import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";




/**
 * | Quantity Range | Discount % |
| -------------- | ---------- |
| 1–9            | 0%         |
| 10–49          | 5%         |
| 50–99          | 10%        |
| 100+           | 15%        |

 */


const productSchema = new Schema({

    productTitle: {
        type: String,
        required: true,
        trim: true,
        maxlenghth: 100
    },
    productDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 256
    },
    originalPrice: {
        type: Number,
        required: true,
        min: 1,
        maxlength: 8,
    },
    discountPercentage: { // Regular discount percentage
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
    },
    // Bulk discount settings (based on quantity)
    bulkThreshold: { // Minimum quantity for bulk discount to apply
        type: Number,
        default: 0, // Default 0 means no specific bulk tier by quantity for this product
        min: 0
    },
    additionalBulkDiscountPercentage: { // Additional discount % applied if quantity meets bulkThreshold
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    quantity: {
        type: Number,
        default: 1,
        required: true,
        min: 0,
    },
    isAvailable: {
        type: Boolean,
        default: false,
        required: true,
    },
    productImage: [{
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    }],
    user:{
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true,
    },
    warranty: {
        type: String,
        required: true,
        trim: true
    },
    review: [{
        type: Schema.Types.ObjectId,
        ref: 'ReviewsAndRatings'
    }
    ]
   
    
}, 
    {
        timestamps: true,
    }  
);


productSchema.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model('Product', productSchema);

