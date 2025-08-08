import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {frequentlyAskedQuestions} from '../models/frequentlyAskedQuestions.model.js';
import { User } from "../models/user.model.js";



/**
 * @desc    User asks a new question (creates an FAQ entry)
 * @route   POST /api/v1/faq/ask
 * @access  Private (User)
 */
const askQuestion = asyncHandler(async (req, res, next) => {
    try {
		const { title } = req.body;
		    const userId = req.user._id; // Get user ID from authenticated request
		
		    if (!title || title.trim() === '') {
		        throw new ApiError(400, "Please provide a question title.");
		    }
		
		    const newQuestion = await frequentlyAskedQuestions.create({
		        title: title.trim(),
		        user: userId,
		        description: '', // Initially empty, to be filled by admin
		        isAnswered: false, // Mark as unanswered
		    });
		
		    return res
			.status(201)
			.json(new ApiResponse(201, newQuestion, "Your question has been submitted successfully."));

	} catch (error) {
		throw new ApiError(500, "Failed to submit your question. Please try again later.");
	}
});

/**
 * @desc    Get all FAQs (publicly accessible, or for users)
 * @route   GET /api/v1/faqs
 * @access  Public
 * @query   answered=true/false (optional, to filter)
 */
const getAllFAQs = asyncHandler(async (req, res, next) => {
   try {
	 const query = {};
	    // Allow filtering by answered status
	    if (req.query.answered !== undefined) {
	        query.isAnswered = req.query.answered === 'true';
	    }
	
	    const faqs = await frequentlyAskedQuestions.find(query)
	        .populate('user', 'name email') // Populate user who asked the question
	        .sort({ createdAt: -1 }); // Show latest questions first
	
	    return res
		.status(200)
		.json(new ApiResponse(200, faqs, "FAQs fetched successfully."));

   } catch (error) {
		throw new ApiError(500, "Failed to fetch FAQs.");
   }
});

/**
 * @desc    Get a single FAQ by ID
 * @route   GET /api/v1/faq/:id
 * @access  Public
 */
const getSingleFAQ = asyncHandler(async (req, res, next) => {
    try {
		const faq = await frequentlyAskedQuestions.findById(req.params.id).populate('user', 'name email');
		
		    if (!faq) {
		        throw new ApiError(404, `FAQ not found with ID: ${req.params.id}`);
		    }
		
		    return res.status(200).json(new ApiResponse(200, faq, "FAQ fetched successfully."));
	} catch (error) {
		throw new ApiError(500, "Failed to fetch the FAQ.");
	}
});

/**
 * @desc    Admin answers a question (updates an FAQ entry)
 * @route   PUT /api/v1/admin/faq/:id/answer
 * @access  Private (Admin)
 */
const answerQuestion = asyncHandler(async (req, res, next) => {
    try {
		const { description } = req.body; // The answer text
		    const faqId = req.params.id;
		
		    if (!description || description.trim() === '') {
		        throw new ApiError(400, "Please provide an answer for the question.");
		    }
		
		    const faq = await frequentlyAskedQuestions.findById(faqId);
		
		    if (!faq) {
		        throw new ApiError(404, `FAQ not found with ID: ${faqId}`);
		    }
		
		    // Update the description and mark as answered
		    faq.description = description.trim();
		    faq.isAnswered = true; // Mark as answered
		    await faq.save(); // `updatedAt` will be automatically updated
		
		    return res.status(200).json(new ApiResponse(200, faq, "FAQ answered successfully."));
	} catch (error) {
		throw new ApiError(500, "Failed to answer the question.");
	}
});

/**
 * @desc    Admin gets all unanswered questions
 * @route   GET /api/v1/admin/faqs/unanswered
 * @access  Private (Admin)
 */
const getUnansweredFAQs = asyncHandler(async (req, res, next) => {
    const unansweredFAQs = await frequentlyAskedQuestions.find({ isAnswered: false })
        .populate('user', 'name email')
        .sort({ createdAt: 1 }); // Show oldest unanswered questions first

    return res.status(200).json(new ApiResponse(200, unansweredFAQs, "Unanswered FAQs fetched successfully."));
});

/**
 * @desc    Admin deletes an FAQ entry
 * @route   DELETE /api/v1/admin/faq/:id
 * @access  Private (Admin)
 */
const deleteFAQ = asyncHandler(async (req, res, next) => {
    try {
		const faq = await frequentlyAskedQuestions.findById(req.params.id);
		
		    if (!faq) {
		        throw new ApiError(404, `FAQ not found with ID: ${req.params.id}`);
		    }
		
		    await faq.deleteOne();
		
		    return res.status(200).json(new ApiResponse(200, null, "FAQ deleted successfully."));
	} catch (error) {
		throw new ApiError(500, "Failed to delete the FAQ.");
	}
});



export {
	askQuestion,
	getAllFAQs,
	getSingleFAQ,
	answerQuestion,
	getUnansweredFAQs,
	deleteFAQ
}