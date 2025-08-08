import { Router } from 'express';
import { verifyJWT, isAdmin } from '../middlewares/auth.middleware';
import {
    askQuestion,
	getAllFAQs,
	getSingleFAQ,
	answerQuestion,
	getUnansweredFAQs,
	deleteFAQ
} from '../controllers/frequentlyAskedQuestions.controller.js';

const router = Router();

//------------------------ User Routes ------------------------//

router.route('/faq/all-faqs').get(getAllFAQs);
router.route('/faq/ask-question').post(verifyJWT, askQuestion);
router.route('/faq/:id').get(getSingleFAQ);

//------------------------ Admin Routes ------------------------//

router.use(verifyJWT);
router.use(isAdmin);

router.route('admin/faqs/answer').post(answerQuestion);
router.route('admin/faqs/unanswered').get(getUnansweredFAQs);
router.route('admin/faq/:id').put(updateFrequentlyAskedQuestion).delete(deleteFAQ);


export default router;