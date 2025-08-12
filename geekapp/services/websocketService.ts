// Frontend WebSocket Service for Real-time Updates
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productService } from './productService';

interface WebSocketEvents {
  // Product events
  'product:new': (product: any) => void;
  'product:updated': (product: any) => void;
  'product:deleted': (data: { productId: string }) => void;
  
  // Order events
  'order:status_update': (order: any) => void;
  
  // Admin events
  'admin:notification': (notification: any) => void;
  'admin:connected': (data: { adminId: string }) => void;
  'admin:disconnected': (data: { adminId: string }) => void;
  
  // Connection events
  'connect': () => void;
  'disconnect': (reason: string) => void;
  'connect_error': (error: Error) => void;
}

type EventCallback = (...args: any[]) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, EventCallback[]> = new Map();
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  // Initialize WebSocket connection
  async connect(userToken?: string): Promise<void> {
    if (this.connectionStatus === 'connected') {
      console.log('📱 WebSocket already connected');
      return;
    }

    try {
      // Get auth token from storage if not provided
      if (!userToken) {
        userToken = await AsyncStorage.getItem('userToken');
      }
      
      this.authToken = userToken;
      this.connectionStatus = 'connecting';

      console.log('🔌 Connecting to WebSocket:', this.baseUrl);

      this.socket = io(this.baseUrl, {
        auth: {
          token: this.authToken,
          clientType: 'client'
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 3000,
        reconnectionDelayMax: 10000,
        maxReconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000,
      });

      this.setupEventHandlers();
      
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      this.connectionStatus = 'error';
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.emit('connect');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('💔 WebSocket disconnected:', reason);
      this.connectionStatus = 'disconnected';
      this.emit('disconnect', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('🚨 WebSocket connection error:', error);
      this.connectionStatus = 'error';
      this.emit('connect_error', error);
    });

    // Product events
    this.socket.on('product:new', (productData: any) => {
      console.log('📦 New product received:', productData.productTitle);
      this.handleProductUpdate('new', productData);
      this.emit('product:new', productData);
    });

    this.socket.on('product:updated', (productData: any) => {
      console.log('📝 Product updated:', productData.productTitle);
      this.handleProductUpdate('updated', productData);
      this.emit('product:updated', productData);
    });

    this.socket.on('product:deleted', (data: { productId: string }) => {
      console.log('🗑️ Product deleted:', data.productId);
      this.handleProductUpdate('deleted', data);
      this.emit('product:deleted', data);
    });

    // Order events
    this.socket.on('order:status_update', (orderData: any) => {
      console.log('📋 Order status updated:', orderData);
      this.emit('order:status_update', orderData);
    });

    // Admin events
    this.socket.on('admin:notification', (notification: any) => {
      console.log('📢 Admin notification:', notification);
      this.emit('admin:notification', notification);
      this.handleAdminNotification(notification);
    });

    this.socket.on('admin:connected', (data: { adminId: string }) => {
      console.log('👑 Admin connected:', data.adminId);
      this.emit('admin:connected', data);
    });

    this.socket.on('admin:disconnected', (data: { adminId: string }) => {
      console.log('👑 Admin disconnected:', data.adminId);
      this.emit('admin:disconnected', data);
    });
  }

  // Event handling methods
  private handleProductUpdate(action: string, data: any): void {
    // Invalidate product cache when products are updated
    if (action === 'new' || action === 'updated' || action === 'deleted') {
      productService.clearCache();
      
      // Invalidate specific product cache if it's an update/delete
      if (action !== 'new' && data.productId) {
        productService.invalidateProductCache(data.productId);
      }
    }
  }

  private handleAdminNotification(notification: any): void {
    // Store admin notifications locally
    this.storeNotification(notification);
  }

  private async storeNotification(notification: any): Promise<void> {
    try {
      const existingNotifications = await AsyncStorage.getItem('admin_notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      
      notifications.unshift({
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false
      });

      // Keep only last 50 notifications
      const limitedNotifications = notifications.slice(0, 50);
      
      await AsyncStorage.setItem('admin_notifications', JSON.stringify(limitedNotifications));
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  // Public methods for emitting events
  emitProductView(productId: string): void {
    if (this.isConnected()) {
      this.socket?.emit('product:view', { productId });
    }
  }

  emitProductSearch(query: string): void {
    if (this.isConnected()) {
      this.socket?.emit('product:search', { query });
    }
  }

  emitOrderCreated(orderData: any): void {
    if (this.isConnected()) {
      this.socket?.emit('order:created', orderData);
    }
  }

  // Event subscription methods
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(callback);
  }

  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]): void {
    if (!callback) {
      this.eventHandlers.delete(event);
      return;
    }

    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.connectionStatus === 'connected' && this.socket?.connected === true;
  }

  getConnectionStatus(): {
    status: string;
    socketId: string | undefined;
    connected: boolean;
    reconnectAttempts: number;
  } {
    return {
      status: this.connectionStatus,
      socketId: this.socket?.id,
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Reconnection management
  async reconnect(): Promise<void> {
    this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.connect(this.authToken || undefined);
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus = 'disconnected';
    this.eventHandlers.clear();
  }

  // Get stored notifications
  async getNotifications(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('admin_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updated = notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      await AsyncStorage.setItem('admin_notifications', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Clear all notifications
  async clearNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem('admin_notifications');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }
}

// Create and export singleton instance
export const webSocketService = new WebSocketService();

// Export for testing and advanced usage
export default WebSocketService;