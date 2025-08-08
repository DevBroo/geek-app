import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ReviewsAndRatings } from "../models/reviewsAndRatings.model.js"
import { Product } from "../models/products.model.js";
import { User } from "../models/user.model.js";


/** * @desc Create a new review for a product
 * @route POST /api/reviews
 * @method POST
* @access Private (User must be authenticated)
* @body {Object} reviewData - The review data containing productId, review, rating, and userId
* @returns {Object} - The created review object or an error response with status code 500.
 */
const createReview = asyncHandler(async (req, res) => {

    try {
        const reviewData = req.body;
        console.log(reviewData);
    
        // Validate review data
        if (!reviewData || !reviewData.review || !reviewData.rating) {
            throw new ApiError(400, "Review data (review and rating) is required");
        }
        if (reviewData.rating < 1 || reviewData.rating > 5) {
            throw new ApiError(400, "Rating must be between 1 and 5");
        }   
        if (!req.user || !req.user._id) {
            throw new ApiError(401, "User not authenticated");
        }
        if (!reviewData.productId) {
            throw new ApiError(400, "Product ID is required");
        }
        if (!req.user.isAdmin && req.user._id.toString() !== reviewData.userId.toString()) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }
    
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
    
        const product = await Product.findById(reviewData.productId);
        if (!product) {
            throw new ApiError(404, "Product not found");
        }
    
        const existingReview = await ReviewsAndRatings.findOne({
            userId: req.user._id,
            productId: reviewData.productId,
        }); 
        if (existingReview) {
            throw new ApiError(400, "You have already reviewed this product");
        }
        
        const review = new ReviewsAndRatings({
            userId: req.user._id,
            productId: reviewData.productId,
            review: reviewData.review,
            rating: reviewData.rating,
            numReviews: 1, // Initialize with 1 review
        });
        await review.save();

        // Update product with new review
        product.reviews = product.reviews || [];
        if (!product.reviews.includes(review._id)) {
            throw new ApiError(404, "Review not found in product");
        }
        product.reviews.push(review._id);
        product.numReviews = product.reviews.length;
        product.rating = (product.rating * (product.numReviews - 1) + review.rating) / product.numReviews;
        await product.save();
        
        return res
        .status(201)
        .json(new ApiResponse(201, true, "Review created successfully", review));
     
    } catch (error) {
        console.error("Error creating review:", error);
        return res.status(500).json(new ApiResponse(500, false, "Internal Server Error", null));
        
    }
 })

/** * @desc Get reviews for a product by product ID
 * @route GET /api/reviews/:id
 * @method GET
* @access Public
*@body {Object} reviewData - The review data containing productId, review, rating, and userId
* @param {string} id - The ID of the product whose reviews you want to fetch.
* @returns {Array<Object>} - An array of review objects associated with the specified product.
*/
const getReviewsByProductId = asyncHandler(async(req,res)=>{

    try {
        const reviews = await ReviewsAndRatings.find({productId:req.params.id}).populate("userId","name email").sort("-createdAt").limit(6);
        if (!reviews || reviews.length === 0) {
            throw new ApiError(404, "No reviews found for this product");
        }
        if (!req.user || !req.user._id) {
            throw new ApiError(401, "User not authenticated");
        }
        if (!req.user.isAdmin && req.user._id.toString() !== reviewData.userId.toString()) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            throw new ApiError(404, "Product not found");
        }   
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }   
        if (!product.reviews.includes(reviewData._id)) {
            throw new ApiError(404, "Review not found in product");
        }
        return res
        .status(200)
        .json(new ApiResponse(200, true, "Reviews fetched successfully", reviews));
    
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json(new ApiResponse(500, false, "Internal Server Error", null));
        
    }
})

/** * @desc Update a review by its ID
 * @route PUT /api/reviews/:id
 * @method PUT
* @access Private (User must be authenticated)
* @body {Object} reviewData - The updated review data containing productId, review, rating, and userId
* @param {string} id - The ID of the review you want to update.
* @returns {Object} - The updated review object or an error response with status code 500.
*/
const updateReviewById = asyncHandler(async(req,res)=>{
    try {
        
        const { reviewId, reviewData } = req.body;

        if (!reviewId || !reviewData) {
            throw new ApiError(400, "Review ID and review data are required");
        }
        if (!req.user || !req.user._id) {
            throw new ApiError(401, "User not authenticated");
        }
        if (!req.user.isAdmin && req.user._id.toString() !== reviewData.userId.toString()) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }

        const review = await ReviewsAndRatings.findById(reviewId);
        if (!review) {
            throw new ApiError(404, "Review not found");
        }

        review.review = reviewData.review || review.review;
        review.rating = reviewData.rating || review.rating;
        
        await review.save();

        return res
            .status(200)
            .json(new ApiResponse(200, true, "Review updated successfully", review));
    } catch (error) {
        console.error("Error updating review:", error);
        return res.status(500).json(new ApiResponse(500, false, "Internal Server Error", null));
        
    }
})


/** * @desc Delete a review by its ID
 * @route DELETE /api/reviews/:id
 *  @method DELETE
* @access Private (User must be authenticated)
* @body {Object} reviewData - The review data containing productId and reviewId
* @param {string} id - The ID of the review you want to delete.
* @returns {Object} - A success message indicating that the review was deleted or an error response with status code 500.
*/
const deleteReviewById = asyncHandler(async(req,res)=>{
    try {
        const { reviewId, reviewData } = req.body;

        if (!reviewId) {
            throw new ApiError(400, "Review ID is required");
        }
        if (!req.user || !req.user._id) {
            throw new ApiError(401, "User not authenticated");
        }
        if (!req.user.isAdmin && req.user._id.toString() !== reviewData.userId.toString()) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }

        const review = await ReviewsAndRatings.findById(reviewId);
        if (!review) {
            throw new ApiError(404, "Review not found");
        }

        await review.remove();

        return res
            .status(200)
            .json(new ApiResponse(200, true, "Review deleted successfully", null));

    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json(new ApiResponse(500, false, "Internal Server Error", null));
        
    }
})

/** @desc Add a review to a product
 * @route POST /api/reviews/add
 * @method POST
 * @access Private (User must be authenticated)
 * @body {Object} reviewData - The review data containing productId and reviewId
 * @returns {Object} - The updated product object or an error response with status code 500.
 */
const addReviewToProduct = asyncHandler(async (req, res) => {
    const reviewData = req.body.review; // Assuming reviewData contains the review text and rating
    
    const { productId, reviewId } = req.body;

    if (!reviewData || !reviewData.review || !reviewData.rating) {
        throw new ApiError(400, "Review data (review and rating) is required");
    }
    if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }
    if (!req.user || !req.user._id) {
        throw new ApiError(401, "User not authenticated");
    }
    if (!productId || !reviewId) {
        throw new ApiError(400, "Product ID and Review ID are required");
    }
    if (!req.user.isAdmin && req.user._id.toString() !== reviewData.userId.toString()) {
        throw new ApiError(403, "You are not authorized to perform this action");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    const review = await ReviewsAndRatingsModel.findById(reviewId);
    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    product.reviews.push(reviewId);
    product.numReviews = product.reviews.length;
    product.rating = (product.rating * (product.numReviews - 1) + review.rating) / product.numReviews;
    await product.save();

  
    review.review = reviewData.review; // Assuming reviewData contains the review text
    review.productId = productId;
    review.userId = req.user._id; // Assuming req.user is populated with the authenticated user's data
    review.numReviews = product.reviews.length;
    review.rating = product.rating / product.numReviews; // Calculate average rating based on all reviews for the product 
    await review.save();

    res.status(200).json(new ApiResponse(200, true, "Review added to product", product));
});


/** @desc Update the rating of a product
 * @route PUT /api/reviews/rating
 *  @method PUT
 * @access Private (User must be authenticated)
 * @body {Object} reviewData - The review data containing productId and rating
 * @returns {Object} - The updated product object or an error response with status code 500.
 */
const updateRatingOfProduct = asyncHandler(async (req, res) => {
   try {
        const { productId, rating } = req.body;
    
        if (!productId || !rating) {
            throw new ApiError(400, "Product ID and rating are required");
        }
        if (rating < 1 || rating > 5) {
            throw new ApiError(400, "Rating must be between 1 and 5");
        }
        if (!req.user || !req.user._id) {
            throw new ApiError(401, "User not authenticated");
        }
        if (!req.user.isAdmin && req.user._id.toString() !== reviewData.userId.toString()) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }
    
        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError(404, "Product not found");
        }
    
        product.rating = rating;
        await product.save();
    
        return res
        .status(200)
        .json(new ApiResponse(200, true, "Product rating updated", product));
        
   } catch (error) {
     console.error("Error updating product rating:", error);
     return res.status(500).json(new ApiResponse(500, false, "Internal Server Error", null));
    
   }
});

/** @desc Delete a review from a product
 * @route DELETE /api/reviews/delete
 * @method DELETE
 * @access Private (User must be authenticated)
 * @body {Object} reviewData - The review data containing productId and reviewId
 * @returns {Object} - The updated product object or an error response with status code 500.
 */
const deleteReviewFromProduct = asyncHandler(async (req, res) => {
    try {
        const { productId, reviewId } = req.body;

        if (!productId || !reviewId) {
            throw new ApiError(400, "Product ID and Review ID are required");
        }
        if (!req.user || !req.user._id) {
            throw new ApiError(401, "User not authenticated");
        }
        if (!req.user.isAdmin && req.user._id.toString() !== reviewData.userId.toString()) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        const reviewIndex = product.reviews.indexOf(reviewId);
        if (reviewIndex === -1) {
            throw new ApiError(404, "Review not found in product");
        }

        product.reviews.splice(reviewIndex, 1);
        product.numReviews = product.reviews.length;
        
        // Recalculate the average rating
        if (product.numReviews > 0) {
            const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0);
            product.rating = totalRating / product.numReviews;
        } else {
            product.rating = 0; // No reviews means no rating
        }

        await product.save();

        return res
            .status(200)
            .json(new ApiResponse(200, true, "Review deleted from product", product));

    } catch (error) {
        console.error("Error deleting review from product:", error);
        return res.status(500).json(new ApiResponse(500, false, "Internal Server Error", null));
    }
}
);


export {
    createReview,
    getReviewsByProductId,
    updateReviewById,
    deleteReviewById,
    addReviewToProduct,
    updateRatingOfProduct,
    deleteReviewFromProduct
}



