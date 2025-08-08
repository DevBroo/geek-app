// Health check routes
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

// Basic health check
router.get('/', asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    database: 'connected' // You can add actual DB health check here
  };

  return res.status(200).json(
    new ApiResponse(200, true, 'Server is healthy', health)
  );
}));

export default router;