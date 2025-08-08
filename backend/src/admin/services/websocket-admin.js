// AdminJS WebSocket Integration Service
// import { wsManager } from '../../config/websocket.js';
import { adminAPI } from '../../config/axios.js';
import jwt from 'jsonwebtoken';

class AdminWebSocketService {
  constructor() {
    this.adminSocket = null;
    this.connectionStatus = 'disconnected';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.adminToken = process.env.ADMIN_TOKEN
  }

  // Initialize WebSocket connection for AdminJS
  async connect(adminToken) {
    if (this.connectionStatus === 'connected') {
      console.log('Admin WebSocket already connected');
      return;
    }

    try {
      // Import Socket.IO client for server-side use
      const { io } = await import('socket.io-client');
      const socketUrl = `http://localhost:${process.env.PORT || 3000}`;
      // Add token validation function
      const isValidToken = (token) => {
        try {
          // Verify token using your auth secret
          const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'your-secret-key');
          return decoded;
        } catch (error) {
          console.error('Token validation error:', error.message);
          return false;
        }
      };
      
      // Add token to connection query parameters
      const connectionOptions = {
        auth: {
          token: this.adminToken,
          clientType: 'admin'
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts
      };
      
      // Add query parameters for authentication
      if (adminToken) {
        connectionOptions.auth = { token: this.adminToken };
      }
      
      this.adminSocket = io(socketUrl, {
        auth: {
          token: this.adminToken,
          clientType: 'admin'
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts
      });

      this.setupEventHandlers();
      this.connectionStatus = 'connecting';
      
      console.log('🔌 Admin WebSocket connecting...');
      
    } catch (error) {
      console.error('❌ Failed to initialize Admin WebSocket:', error);
      this.connectionStatus = 'error';
    }
  }

  setupEventHandlers() {
    if (!this.adminSocket) return;

    // Connection events
    this.adminSocket.on('connect', () => {
      console.log('✅ Admin WebSocket connected:', this.adminSocket.id);
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.onAdminConnected();
    });

    this.adminSocket.on('disconnect', (reason) => {
      console.log('💔 Admin WebSocket disconnected:', reason);
      this.connectionStatus = 'disconnected';
      this.onAdminDisconnected(reason);
    });

    this.adminSocket.on('connect_error', (error) => {
      console.error('🚨 Admin WebSocket connection error:', error);
      console.error('Current auth token:', adminToken ? 'Present' : 'Missing');
      this.connectionStatus = 'error';
      this.handleReconnection();
    });

    // Product events
    this.adminSocket.on('product:created_ack', (data) => {
      console.log('📦 Product creation acknowledged:', data.productTitle);
      this.notifyAdminInterface('product_created', data);
    });

    this.adminSocket.on('product:updated_ack', (data) => {
      console.log('📝 Product update acknowledged:', data.productTitle);
      this.notifyAdminInterface('product_updated', data);
    });

    this.adminSocket.on('product:deleted_ack', (data) => {
      console.log('🗑️ Product deletion acknowledged:', data.productId);
      this.notifyAdminInterface('product_deleted', data);
    });

    // Client activity events
    this.adminSocket.on('product:viewed', (data) => {
      console.log('👁️ Product viewed by client:', data);
      this.updateAdminAnalytics('product_view', data);
    });

    this.adminSocket.on('product:searched', (data) => {
      console.log('🔍 Product searched by client:', data);
      this.updateAdminAnalytics('product_search', data);
    });

    this.adminSocket.on('order:new', (data) => {
      console.log('🛒 New order received:', data);
      this.notifyAdminInterface('new_order', data);
    });

    // Analytics events
    this.adminSocket.on('admin:analytics_data', (data) => {
      console.log('📊 Analytics data received:', data);
      this.updateAdminDashboard(data);
    });
  }

  // Handle reconnection logic
  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        if (this.connectionStatus !== 'connected') {
          this.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.connectionStatus = 'failed';
    }
  }

  // Admin interface event handlers
  onAdminConnected() {
    // Request initial analytics
    this.requestAnalytics();
    
    // Set up periodic analytics updates
    this.analyticsInterval = setInterval(() => {
      this.requestAnalytics();
    }, 30000); // Every 30 seconds
  }

  onAdminDisconnected(reason) {
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
    }
  }

  // Emit events from AdminJS
  emitProductCreated(productData) {
    if (this.isConnected()) {
      this.adminSocket.emit('product:created', productData);
      console.log('📡 Emitted product:created event');
    }
  }

  emitProductUpdated(productData) {
    if (this.isConnected()) {
      this.adminSocket.emit('product:updated', productData);
      console.log('📡 Emitted product:updated event');
    }
  }

  emitProductDeleted(productId) {
    if (this.isConnected()) {
      this.adminSocket.emit('product:deleted', { productId });
      console.log('📡 Emitted product:deleted event');
    }
  }

  emitOrderUpdated(orderData) {
    if (this.isConnected()) {
      this.adminSocket.emit('order:updated', orderData);
      console.log('📡 Emitted order:updated event');
    }
  }

  // Broadcast admin notifications
  broadcastToClients(message) {
    if (this.isConnected()) {
      this.adminSocket.emit('admin:broadcast', {
        message,
        timestamp: new Date(),
        type: 'notification'
      });
      console.log('📢 Broadcasted admin message to clients');
    }
  }

  // Request analytics data
  requestAnalytics() {
    if (this.isConnected()) {
      this.adminSocket.emit('admin:analytics_request');
    }
  }

  // Helper methods for AdminJS integration
  notifyAdminInterface(eventType, data) {
    // This could trigger AdminJS UI updates
    // You can implement custom AdminJS components to listen for these
    console.log(`🔔 Admin interface notification: ${eventType}`, data);
    
    // Example: Update global admin state
    if (global.adminNotifications) {
      global.adminNotifications.push({
        type: eventType,
        data,
        timestamp: new Date()
      });
    }
  }

  updateAdminAnalytics(eventType, data) {
    // Update real-time analytics for admin dashboard
    console.log(`📈 Admin analytics update: ${eventType}`, data);
    
    // You can store this in a global state or send to AdminJS components
    if (global.adminAnalytics) {
      if (!global.adminAnalytics[eventType]) {
        global.adminAnalytics[eventType] = [];
      }
      global.adminAnalytics[eventType].push({
        ...data,
        timestamp: new Date()
      });
    }
  }

  updateAdminDashboard(analyticsData) {
    // Update dashboard with real-time data
    console.log('📊 Updating admin dashboard with:', analyticsData);
    
    if (global.adminDashboard) {
      global.adminDashboard.realTimeData = analyticsData;
    }
  }

  // Utility methods
  isConnected() {
    return this.connectionStatus === 'connected' && this.adminSocket?.connected;
  }

  getConnectionStatus() {
    return {
      status: this.connectionStatus,
      socketId: this.adminSocket?.id,
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Disconnect
  disconnect() {
    if (this.adminSocket) {
      this.adminSocket.disconnect();
      console.log('🔌 Admin WebSocket disconnected');
    }
    
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
    }
    
    this.connectionStatus = 'disconnected';
  }

  // Integration with AdminJS hooks
  async handleAdminAction(action, resource, data) {
    try {
      switch (action) {
        case 'new':
          if (resource === 'Product') {
            this.emitProductCreated(data);
            // Also trigger cache invalidation via API
            await adminAPI.delete('/products/cache/clear');
          }
          break;
          
        case 'edit':
          if (resource === 'Product') {
            this.emitProductUpdated(data);
            await adminAPI.delete('/products/cache/clear');
          }
          break;
          
        case 'delete':
          if (resource === 'Product') {
            this.emitProductDeleted(data._id);
            await adminAPI.delete('/products/cache/clear');
          }
          break;
      }
    } catch (error) {
      console.error('Error handling admin action:', error);
    }
  }
}

// Export singleton instance
export const adminWS = new AdminWebSocketService();

// Initialize globals for AdminJS integration
if (typeof global !== 'undefined') {
  global.adminNotifications = [];
  global.adminAnalytics = {};
  global.adminDashboard = {};
}

export default AdminWebSocketService;