// WebSocket monitoring and health check routes
import { Router } from 'express';
import { comprehensiveWsManager } from '../config/comprehensive-websocket.js';
import { adminWS } from '../admin/services/websocket-admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

// WebSocket health check
router.get('/health', asyncHandler(async (req, res) => {
  const stats = comprehensiveWsManager.getStats();
  const adminStatus = adminWS.getConnectionStatus();
  
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    websocket: {
      server: {
        initialized: comprehensiveWsManager.io !== null,
        totalConnections: stats.totalConnections,
        adminConnections: stats.adminConnections,
        clientConnections: stats.clientConnections,
        rooms: stats.rooms
      },
      adminService: {
        status: adminStatus.status,
        connected: adminStatus.connected,
        socketId: adminStatus.socketId,
        reconnectAttempts: adminStatus.reconnectAttempts
      }
    },
    memory: process.memoryUsage()
  };

  return res.status(200).json(
    new ApiResponse(200, true, 'WebSocket health check', health)
  );
}));

// Get WebSocket statistics (Admin only)
router.get('/stats', asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const stats = comprehensiveWsManager.getStats();
  const adminAnalytics = global.adminAnalytics || {};
  const adminNotifications = global.adminNotifications || [];

  const detailedStats = {
    connections: stats,
    analytics: {
      totalEvents: Object.keys(adminAnalytics).length,
      eventSummary: Object.entries(adminAnalytics).map(([event, data]) => ({
        event,
        count: Array.isArray(data) ? data.length : 0,
        latest: Array.isArray(data) && data.length > 0 ? data[0] : null
      }))
    },
    notifications: {
      total: adminNotifications.length,
      recent: adminNotifications.slice(0, 5)
    },
    performance: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  return res.status(200).json(
    new ApiResponse(200, true, 'WebSocket statistics', detailedStats)
  );
}));

// Force reconnect AdminJS WebSocket (Admin only)
router.post('/admin/reconnect', asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  try {
    adminWS.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await adminWS.connect();
    
    return res.status(200).json(
      new ApiResponse(200, true, 'AdminJS WebSocket reconnected')
    );
  } catch (error) {
    throw new ApiError(500, 'Failed to reconnect AdminJS WebSocket');
  }
}));

// Broadcast message to all clients (Admin only)
router.post('/admin/broadcast', asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const { message, type = 'notification' } = req.body;
  
  if (!message) {
    throw new ApiError(400, 'Message is required');
  }

  const notification = {
    message,
    type,
    timestamp: new Date(),
    from: `Admin (${req.user.fullName || req.user.email})`
  };

  comprehensiveWsManager.broadcastToClients('admin:notification', notification);
  
  return res.status(200).json(
    new ApiResponse(200, true, 'Message broadcasted to all clients', notification)
  );
}));

// Get connected clients list (Admin only)
router.get('/clients', asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const stats = comprehensiveWsManager.getStats();
  
  return res.status(200).json(
    new ApiResponse(200, true, 'Connected clients', {
      totalClients: stats.clientConnections,
      totalAdmins: stats.adminConnections,
      rooms: stats.rooms,
      timestamp: new Date()
    })
  );
}));

// Test WebSocket connection
router.post('/test', asyncHandler(async (req, res) => {
  const testEvent = {
    type: 'test',
    message: 'WebSocket test event',
    timestamp: new Date(),
    testId: Date.now()
  };

  // Broadcast test event to all connected clients
  comprehensiveWsManager.broadcastToClients('websocket:test', testEvent);
  
  return res.status(200).json(
    new ApiResponse(200, true, 'Test event broadcasted', testEvent)
  );
}));

export default router;