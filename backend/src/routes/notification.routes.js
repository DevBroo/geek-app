import express from 'express';
import { isAdmin, verifyJWT } from '../middlewares/auth.middleware.js';
import {createNotification, getNotifications, getNotificationById, markNotificationAsRead} from '../controllers/notification.controller.js';

const router = express.Router();

router.route('/').get(verifyJWT, getNotifications);
router.route('/:notificationId').get(verifyJWT, getNotificationById);
router.route('/:notificationId/read').put(verifyJWT, markNotificationAsRead);

// Admin routes
router.route('/admin/notifications').get(verifyJWT, isAdmin, getNotifications);
router.route('/admin/notifications').post(verifyJWT, isAdmin, createNotification);

export default router;