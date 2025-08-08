import express from "express";
import {  updateOrderStatus, updateOrderToPaid, getAllOrders, deleteOrder, processOrderReturn, getMyOrderDetails, getSingleOrderDetails } from "../controllers/order.controller.js";
import { createOrderAndInitiatePaytm, paytmCallback, getOrderPaymentStatus } from "../controllers/payment.controller.js"
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.route("/order/my-orders").get(getMyOrderDetails);
router.route('/order/new').post(verifyJWT, createOrderAndInitiatePaytm); // To create an order and start Paytm PG
router.route('/order/:id').get(verifyJWT, getSingleOrderDetails);
router.route('/order/payment/status/:orderId').get(verifyJWT, getOrderPaymentStatus); // For polling order payment status

//-------------------------- Admin Routes -----------------------------//

router.route("admin/orders/:id").delete(verifyJWT, isAdmin, deleteOrder);
router.route("admin/orders/status/:id").put(verifyJWT, isAdmin, updateOrderStatus);
router.route("admin/orders/paid/:id").put(verifyJWT, isAdmin, updateOrderToPaid);
router.route("admin/order/:id/return").put(verifyJWT, isAdmin, processOrderReturn);
router.route("admin/orders/orders").get( verifyJWT, isAdmin, getAllOrders);


// Paytm Payment Gateway Callback (Publicly accessible, no auth)
// This must be a POST route configured in your Paytm dashboard.
router.route('/payment/callback').post(
    express.urlencoded({ extended: true, limit: '10kb' }), // For Paytm PG callback
    paytmCallback
);


export default router;