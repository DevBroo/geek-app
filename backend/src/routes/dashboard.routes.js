// backend/src/routes/dashboardRoutes.js

import express from 'express';
const router = express.Router();

import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { verifyJWT, isAdmin } from '../middlewares/auth.middleware.js';


// Admin-only route for dashboard statistics
router.route('/admin/dashboard').get(verifyJWT, isAdmin, getDashboardStats);

export default router;