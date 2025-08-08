// WebSocket Configuration with Socket.IO
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

class WebSocketManager {
  constructor() {
    this.io = null;
    this.adminSockets = new Map(); // Track admin connections
    this.clientSockets = new Map(); // Track client connections
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
    
    console.log('🔌 WebSocket server initialized');
    return this.io;
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      const clientType = socket.handshake.auth.clientType; // 'admin' or 'client'
      console.log('🔐 WebSocket authentication middleware triggered in webhooks.js');
      console.log('socket auth token:', token, 'clientType:', clientType);
      console.log('socket auth headers:', socket.handshake.headers);
      console.log(' socket auth handshake: ', socket.handshake.auth);
      
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
            socket.clientType = clientType || 'client';
          } else {
            console.warn('Empty token provided, defaulting to client');
            socket.clientType = 'client';
          }
        } catch (error) {
          console.error('Socket auth error:', error.message);
          socket.clientType = 'client'; // Default to client if token invalid
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

      // Track connections by type
      if (socket.clientType === 'admin') {
        this.adminSockets.set(socket.id, socket);
        socket.join('admin_room');
        this.broadcastToClients('admin_connected', { adminId: socket.id });
      } else {
        this.clientSockets.set(socket.id, socket);
        socket.join('client_room');
      }

      // Handle product-related events
      this.setupProductEvents(socket);
      
      // Handle category events
      this.setupCategoryEvents(socket);
      
      // Handle order events
      this.setupOrderEvents(socket);

      // Handle custom admin events
      this.setupAdminEvents(socket);

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`💔 ${socket.clientType} disconnected:`, socket.id, reason);
        
        if (socket.clientType === 'admin') {
          this.adminSockets.delete(socket.id);
          this.broadcastToClients('admin_disconnected', { adminId: socket.id });
        } else {
          this.clientSockets.delete(socket.id);
        }
      });
    });
  }

  setupProductEvents(socket) {
    // Product events from admin
    socket.on('product:created', (data) => {
      console.log('📦 Product created:', data.productTitle);
      this.broadcastToClients('product:new', data);
      this.broadcastToAdmins('product:created_ack', data, socket.id);
    });

    socket.on('product:updated', (data) => {
      console.log('📝 Product updated:', data.productTitle);
      this.broadcastToClients('product:updated', data);
      this.broadcastToAdmins('product:updated_ack', data, socket.id);
    });

    socket.on('product:deleted', (data) => {
      console.log('🗑️ Product deleted:', data.productId);
      this.broadcastToClients('product:deleted', data);
      this.broadcastToAdmins('product:deleted_ack', data, socket.id);
    });

    // Product events from clients
    socket.on('product:view', (data) => {
      this.broadcastToAdmins('product:viewed', {
        productId: data.productId,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    socket.on('product:search', (data) => {
      this.broadcastToAdmins('product:searched', {
        query: data.query,
        userId: socket.userId,
        timestamp: new Date()
      });
    });
  }

  setupCategoryEvents(socket) {
    socket.on('category:created', (data) => {
      this.broadcastToClients('category:new', data);
    });

    socket.on('category:updated', (data) => {
      this.broadcastToClients('category:updated', data);
    });

    socket.on('category:deleted', (data) => {
      this.broadcastToClients('category:deleted', data);
    });
  }

  setupOrderEvents(socket) {
    socket.on('order:created', (data) => {
      this.broadcastToAdmins('order:new', data);
      socket.to('client_room').emit('order:status', data);
    });

    socket.on('order:updated', (data) => {
      this.broadcastToClients('order:status_update', data);
      this.broadcastToAdmins('order:updated_ack', data);
    });
  }

  setupAdminEvents(socket) {
    // Admin-specific events
    socket.on('admin:broadcast', (data) => {
      if (socket.clientType === 'admin') {
        this.broadcastToClients('admin:notification', data);
      }
    });

    socket.on('admin:analytics_request', (data) => {
      if (socket.clientType === 'admin') {
        // Send real-time analytics
        socket.emit('admin:analytics_data', {
          connectedClients: this.clientSockets.size,
          connectedAdmins: this.adminSockets.size - 1, // Exclude current admin
          serverUptime: process.uptime(),
          timestamp: new Date()
        });
      }
    });
  }

  // Utility methods for broadcasting
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

  // Broadcast to specific room
  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  // Send to specific socket
  sendToSocket(socketId, event, data) {
    const socket = this.adminSockets.get(socketId) || this.clientSockets.get(socketId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.adminSockets.size + this.clientSockets.size,
      adminConnections: this.adminSockets.size,
      clientConnections: this.clientSockets.size,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys())
    };
  }

  // Trigger events programmatically (for backend use)
  emitProductEvent(event, productData) {
    switch (event) {
      case 'created':
        this.broadcastToClients('product:new', productData);
        this.broadcastToAdmins('product:created_ack', productData);
        break;
      case 'updated':
        this.broadcastToClients('product:updated', productData);
        this.broadcastToAdmins('product:updated_ack', productData);
        break;
      case 'deleted':
        this.broadcastToClients('product:deleted', productData);
        this.broadcastToAdmins('product:deleted_ack', productData);
        break;
    }
  }

  emitOrderEvent(event, orderData) {
    switch (event) {
      case 'created':
        this.broadcastToAdmins('order:new', orderData);
        break;
      case 'updated':
        this.broadcastToClients('order:status_update', orderData);
        break;
    }
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();

// Export class for testing
export default WebSocketManager;