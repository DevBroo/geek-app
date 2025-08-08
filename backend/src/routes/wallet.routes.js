// routes/walletRoutes.js
import express from 'express';
const router = express.Router();
import  {
    initiateWalletDeposit,
    initiateWalletWithdrawal,
    getWalletHistory,
    payWithWallet,
    paytmPayoutsCallback // Payouts specific webhook
} from '../controllers/wallet.controller.js'; // Assuming wallet logic is in walletController

import { verifyJWT } from '../middlewares/auth.middleware.js';



// // User Wallet Routes (Authenticated)
// router.route('/wallet/deposit/initiate').post(verifyJWT, initiateWalletDeposit);
// router.route('/wallet/withdraw/initiate').post(verifyJWT, initiateWalletWithdrawal);
// router.route('/wallet/history').get(verifyJWT, getWalletHistory);
// router.route('/wallet/pay').post(verifyJWT, payWithWallet);

// // Paytm Callbacks (DO NOT PROTECT WITH AUTH - they are server-to-server or redirects)
// // The payment gateway callback for deposits (reusing the main Paytm PG callback)
// router.route('/payment/callback').post(
//     express.urlencoded({ extended: true, limit: '10kb' }), // For Paytm PG callback
//     paytmCallback
// );

// // Paytm Payouts Callback (Webhook for withdrawals)
// router.route('/wallet/payout-callback').post(
//     express.json({ limit: '10kb' }), // Assuming Payouts webhook sends JSON
//     paytmPayoutsCallback
// );


// User Wallet Routes (Authenticated)
router.route('/wallet/deposit/initiate').post(verifyJWT, initiateWalletDeposit);
router.route('/wallet/withdraw/initiate').post(verifyJWT, initiateWalletWithdrawal);
router.route('/wallet/history').get(verifyJWT, getWalletHistory);
router.route('/wallet/pay').post(verifyJWT, payWithWallet); // Endpoint to pay for an order using wallet balance

// Paytm Payouts Callback (Webhook for withdrawals) - Publicly accessible, no auth
router.route('/wallet/payout-callback').post(
    express.json({ limit: '10kb' }), // Assuming Payouts webhook sends JSON
    paytmPayoutsCallback
);



export default router;