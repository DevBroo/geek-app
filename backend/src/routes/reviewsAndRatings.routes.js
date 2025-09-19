import { Router } from 'express';
import { verifyJWT, isAdmin } from '../middlewares/auth.middleware.js';
import {
  createReview,
  getReviewsByProductId,
  updateReviewById,
  deleteReviewById,
  addReviewToProduct,
  updateRatingOfProduct,
  deleteReviewFromProduct

} from '../controllers/reviewAndRatings.controller.js';

const router = Router();

router.post('/:id/create', verifyJWT, createReview);
router.get('/:id', getReviewsByProductId);
router.post('/:id/add-review', verifyJWT, addReviewToProduct);
router.patch('/:id/update-rating', verifyJWT, updateRatingOfProduct);
router.delete('/:id/delete-review', verifyJWT, deleteReviewFromProduct);

// Admin
router.put('/reviews/:id', verifyJWT, isAdmin, updateReviewById);
router.delete('/reviews/:id', verifyJWT, isAdmin, deleteReviewById);

export default router;