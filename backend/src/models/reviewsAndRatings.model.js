import mongoose, {Schema} from "mongoose";


const reviewsAndRatingsSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId:{
        type: Schema.Types.ObjectId,
        ref:'Product',
        required: true
    },
    review: {
        type: String,
        required: true
    },
    rating:{
        type:Number,
        min: [1, "Rating must be between 1 and 5"],
        max: [5, "Rating must be between 1 and 5"],
        required: true
    },
    numReviews:{
        type: Number,
        default: 0
    }

},
{
    timestamps:true
});



export const ReviewsAndRatings = mongoose.model('ReviewsAndRatings', reviewsAndRatingsSchema);