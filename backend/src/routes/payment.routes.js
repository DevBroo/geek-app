import express from 'express';

import {
    createOrderAndInitiatePaytm,
    paytmCallback,
    getOrderPaymentStatus
} from '../controllers/payment.controller.js';
import { verifyJWT, isAdmin } from '../middlewares/auth.middleware.js';


const router = express.Router();


// Route to initiate a payment order and get transaction token
router.route('/payment/paytm/create-order-payment').post(verifyJWT, createOrderAndInitiatePaytm);

// Callback endpoint for Paytm (MUST be publicly accessible without auth)
// IMPORTANT: Use specific body parser middleware for this route if your global app uses express.json()
// Paytm sends x-www-form-urlencoded data for callbacks.
router.route('/payment/callback').post(
    express.urlencoded({ extended: true, limit: '10kb' }), // Use urlencoded for Paytm callback
    paytmCallback
);

// Route to check status of a specific order (for client polling)
router.route('/payment/paytm/status/:orderId').get(verifyJWT, isAdmin, getOrderPaymentStatus);


//-------------------------- Admin Routes -----------------------------//




export default router;