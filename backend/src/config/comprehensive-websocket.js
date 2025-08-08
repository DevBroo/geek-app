// Enhanced WebSocket Configuration for ALL Data Types
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

class ComprehensiveWebSocketManager {
  constructor() {
    this.io = null;
    this.adminSockets = new Map();
    this.clientSockets = new Map();
    this.userSockets = new Map(); // Map userId to socketId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? [process.env.FRONTEND_URL, process.env.ADMIN_URL]
          : ["http://localhost:3000", "http://localhost:8080", "http://localhost:19006"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
    
    console.log('🔌 Comprehensive WebSocket server initialized');
    return this.io;
  }

  setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      const clientType = socket.handshake.auth.clientType;
      console.log('🔐 WebSocket authentication middleware triggered in comprehensive-webhooks.js');
      console.log('socket auth token:', token, 'clientType:', clientType);
      console.log('socket auth headers:', socket.handshake.headers);
      console.log(' socket auth handshake: ', socket.handshake.auth);
      console.log("socket", socket.handshake)
      
      if (!token && clientType === 'admin') {
        return next(new Error('Admin authentication required'));
      }

      if (token) {
        try {
          // Clean and validate token
          let cleanToken = token;
          if (typeof token === 'string') {
            // Remove 'Bearer ' prefix if present
            cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
            // Remove any extra whitespace
            cleanToken = cleanToken.trim();
          }

          // Verify token only if it's not empty
          if (cleanToken && cleanToken.length > 0) {
            const decoded = jwt.verify(cleanToken, process.env.ACCESS_TOKEN_SECRET);
            socket.userId = decoded._id;
            socket.userRole = decoded.role;
            socket.userEmail = decoded.email;
            socket.clientType = clientType || 'client';
          } else {
            console.warn('Empty token provided, defaulting to client');
            socket.clientType = 'client';
          }
        } catch (error) {
          console.error('Socket auth error:', error.message);
          socket.clientType = 'client';
        }
      } else {
        socket.clientType = 'client';
      }

      next();
    });
  }

  setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔗 ${socket.clientType} connected:`, socket.id);

      // Track connections
      if (socket.clientType === 'admin') {
        this.adminSockets.set(socket.id, socket);
        socket.join('admin_room');
        this.broadcastToClients('admin_connected', { adminId: socket.id });
      } else {
        this.clientSockets.set(socket.id, socket);
        socket.join('client_room');
        
        // Map user to socket for direct messaging
        if (socket.userId) {
          this.userSockets.set(socket.userId, socket.id);
          socket.join(`user_${socket.userId}`);
        }
      }

      // Setup all event handlers
      this.setupProductEvents(socket);
      this.setupOrderEvents(socket);
      this.setupNotificationEvents(socket);
      this.setupWalletEvents(socket);
      this.setupTransactionEvents(socket);
      this.setupCartEvents(socket);
      this.setupUserEvents(socket);
      this.setupReviewEvents(socket);
      this.setupFAQEvents(socket);
      this.setupCategoryEvents(socket);
      this.setupAdminEvents(socket);

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`💔 ${socket.clientType} disconnected:`, socket.id, reason);
        
        if (socket.clientType === 'admin') {
          this.adminSockets.delete(socket.id);
          this.broadcastToClients('admin_disconnected', { adminId: socket.id });
        } else {
          this.clientSockets.delete(socket.id);
          if (socket.userId) {
            this.userSockets.delete(socket.userId);
          }
        }
      });
    });
  }

  // ========================= PRODUCT EVENTS =========================
  setupProductEvents(socket) {
    socket.on('product:view', (data) => {
      this.broadcastToAdmins('product:viewed', {
        productId: data.productId,
        userId: socket.userId,
        userEmail: socket.userEmail,
        timestamp: new Date()
      });
    });

    socket.on('product:search', (data) => {
      this.broadcastToAdmins('product:searched', {
        query: data.query,
        userId: socket.userId,
        userEmail: socket.userEmail,
        timestamp: new Date()
      });
    });

    socket.on('product:add_to_wishlist', (data) => {
      this.broadcastToAdmins('product:wishlisted', {
        productId: data.productId,
        userId: socket.userId,
        timestamp: new Date()
      });
    });
  }

  // ========================= ORDER EVENTS =========================
  setupOrderEvents(socket) {
    socket.on('order:create', (data) => {
      // Notify all admins about new order
      this.broadcastToAdmins('order:new_pending', {
        orderId: data.orderId,
        userId: socket.userId,
        userEmail: socket.userEmail,
        totalAmount: data.totalAmount,
        items: data.items,
        timestamp: new Date()
      });
    });

    socket.on('order:track', (data) => {
      // Log order tracking activity
      this.broadcastToAdmins('order:tracking_requested', {
        orderId: data.orderId,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    socket.on('order:cancel_request', (data) => {
      this.broadcastToAdmins('order:cancellation_requested', {
        orderId: data.orderId,
        userId: socket.userId,
        reason: data.reason,
        timestamp: new Date()
      });
    });
  }

  // ========================= NOTIFICATION EVENTS =========================
  setupNotificationEvents(socket) {
    socket.on('notification:read', (data) => {
      this.broadcastToAdmins('notification:read_status', {
        notificationId: data.notificationId,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    socket.on('notification:subscribe', (data) => {
      // User subscribes to specific notification types
      socket.join(`notifications_${data.type}`);
      console.log(`📱 User ${socket.userId} subscribed to ${data.type} notifications`);
    });
  }

  // ========================= WALLET EVENTS =========================
  setupWalletEvents(socket) {
    socket.on('wallet:balance_request', (data) => {
      this.broadcastToAdmins('wallet:balance_requested', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    socket.on('wallet:add_money', (data) => {
      this.broadcastToAdmins('wallet:money_added', {
        userId: socket.userId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        timestamp: new Date()
      });
    });
  }

  // ========================= TRANSACTION EVENTS =========================
  setupTransactionEvents(socket) {
    socket.on('transaction:initiate', (data) => {
      this.broadcastToAdmins('transaction:initiated', {
        transactionId: data.transactionId,
        userId: socket.userId,
        amount: data.amount,
        type: data.type,
        timestamp: new Date()
      });
    });
  }

  // ========================= CART EVENTS =========================
  setupCartEvents(socket) {
    socket.on('cart:add_item', (data) => {
      this.broadcastToAdmins('cart:item_added_analytics', {
        productId: data.productId,
        quantity: data.quantity,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    socket.on('cart:remove_item', (data) => {
      this.broadcastToAdmins('cart:item_removed_analytics', {
        productId: data.productId,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    socket.on('cart:checkout_start', (data) => {
      this.broadcastToAdmins('cart:checkout_initiated', {
        userId: socket.userId,
        cartTotal: data.total,
        itemCount: data.itemCount,
        timestamp: new Date()
      });
    });
  }

  // ========================= USER EVENTS =========================
  setupUserEvents(socket) {
    socket.on('user:profile_update', (data) => {
      this.broadcastToAdmins('user:profile_updated', {
        userId: socket.userId,
        changes: data.changes,
        timestamp: new Date()
      });
    });

    socket.on('user:support_request', (data) => {
      this.broadcastToAdmins('user:support_requested', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        subject: data.subject,
        message: data.message,
        priority: data.priority || 'normal',
        timestamp: new Date()
      });
    });
  }

  // ========================= REVIEW EVENTS =========================
  setupReviewEvents(socket) {
    socket.on('review:submit', (data) => {
      this.broadcastToAdmins('review:new_submission', {
        productId: data.productId,
        userId: socket.userId,
        rating: data.rating,
        comment: data.comment,
        timestamp: new Date()
      });
    });
  }

  // ========================= FAQ EVENTS =========================
  setupFAQEvents(socket) {
    socket.on('faq:question', (data) => {
      this.broadcastToAdmins('faq:user_question', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        question: data.question,
        category: data.category,
        timestamp: new Date()
      });
    });
  }

  // ========================= CATEGORY EVENTS =========================
  setupCategoryEvents(socket) {
    socket.on('category:browse', (data) => {
      this.broadcastToAdmins('category:browsing_analytics', {
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        userId: socket.userId,
        timestamp: new Date()
      });
    });
  }

  // ========================= ADMIN EVENTS =========================
  setupAdminEvents(socket) {
    socket.on('admin:dashboard_view', () => {
      if (socket.clientType === 'admin') {
        // Send real-time dashboard data
        this.sendRealTimeDashboardData(socket);
      }
    });

    socket.on('admin:user_message', (data) => {
      if (socket.clientType === 'admin') {
        // Send message directly to specific user
        this.sendToUser(data.userId, 'admin:message', {
          message: data.message,
          from: 'Admin Support',
          timestamp: new Date()
        });
      }
    });
  }

  // ========================= UTILITY METHODS =========================
  
  // Send real-time dashboard data to admin
  sendRealTimeDashboardData(adminSocket) {
    const dashboardData = {
      connectedUsers: this.clientSockets.size,
      connectedAdmins: this.adminSockets.size,
      totalConnections: this.adminSockets.size + this.clientSockets.size,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    };

    adminSocket.emit('admin:dashboard_data', dashboardData);
  }

  // Enhanced broadcasting methods
  broadcastToClients(event, data, excludeSocketId = null) {
    this.clientSockets.forEach((clientSocket, socketId) => {
      if (socketId !== excludeSocketId) {
        clientSocket.emit(event, data);
      }
    });
  }

  broadcastToAdmins(event, data, excludeSocketId = null) {
    this.adminSockets.forEach((adminSocket, socketId) => {
      if (socketId !== excludeSocketId) {
        adminSocket.emit(event, data);
      }
    });
  }

  // Send to specific user
  sendToUser(userId, event, data) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      const socket = this.clientSockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
        return true;
      }
    }
    return false;
  }

  // Send to specific socket
  sendToSocket(socketId, event, data) {
    const socket = this.adminSockets.get(socketId) || this.clientSockets.get(socketId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }

  // Broadcast to room
  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  // Event emitters for all data types
  emitProductEvent(action, data) {
    this.broadcastToClients(`product:${action}`, data);
    this.broadcastToAdmins(`product:${action}_ack`, data);
  }

  emitOrderEvent(action, data) {
    this.broadcastToAdmins(`order:${action}`, data);
    if (data.userId) {
      this.sendToUser(data.userId, `order:${action}_update`, data);
    }
  }

  emitNotificationEvent(action, data) {
    if (data.userId) {
      this.sendToUser(data.userId, `notification:${action}`, data);
    } else {
      this.broadcastToClients(`notification:${action}`, data);
    }
  }

  emitWalletEvent(action, data) {
    if (data.userId) {
      this.sendToUser(data.userId, `wallet:${action}`, data);
    }
    this.broadcastToAdmins(`wallet:${action}_admin`, data);
  }

  emitTransactionEvent(action, data) {
    if (data.userId) {
      this.sendToUser(data.userId, `transaction:${action}`, data);
    }
    this.broadcastToAdmins(`transaction:${action}_admin`, data);
  }

  emitCartEvent(action, data) {
    if (data.userId) {
      this.sendToUser(data.userId, `cart:${action}`, data);
    }
  }

  emitUserEvent(action, data) {
    this.broadcastToAdmins(`user:${action}`, data);
  }

  emitReviewEvent(action, data) {
    this.broadcastToClients(`review:${action}`, data);
    this.broadcastToAdmins(`review:${action}_admin`, data);
  }

  emitFAQEvent(action, data) {
    this.broadcastToClients(`faq:${action}`, data);
  }

  emitCategoryEvent(action, data) {
    this.broadcastToClients(`category:${action}`, data);
  }

  // Get comprehensive statistics
  getStats() {
    return {
      totalConnections: this.adminSockets.size + this.clientSockets.size,
      adminConnections: this.adminSockets.size,
      clientConnections: this.clientSockets.size,
      authenticatedUsers: this.userSockets.size,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys()),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
}

// Export singleton instance
export const comprehensiveWsManager = new ComprehensiveWebSocketManager();

export default ComprehensiveWebSocketManager;