// Comprehensive Frontend WebSocket Service for ALL Data Types
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ComprehensiveWebSocketEvents {
  // Product events
  'product:created': (product: any) => void;
  'product:updated': (product: any) => void;
  'product:deleted': (data: { productId: string }) => void;
  
  // Order events
  'order:created_update': (order: any) => void;
  'order:updated_update': (order: any) => void;
  'order:status_updated': (data: any) => void;
  
  // Notification events
  'notification:created': (notification: any) => void;
  'notification:broadcast': (notification: any) => void;
  
  // Wallet events
  'wallet:balance_updated': (data: any) => void;
  'wallet:updated': (wallet: any) => void;
  
  // Transaction events
  'transaction:created': (transaction: any) => void;
  'transaction:status_updated': (data: any) => void;
  
  // Cart events
  'cart:item_added': (data: any) => void;
  'cart:item_updated': (data: any) => void;
  'cart:item_removed': (data: any) => void;
  
  // User events
  'user:created': (user: any) => void;
  'user:updated': (user: any) => void;
  
  // Review events
  'review:created': (review: any) => void;
  'review:updated': (review: any) => void;
  
  // FAQ events
  'faq:created': (faq: any) => void;
  'faq:updated': (faq: any) => void;
  
  // Category events
  'category:created': (category: any) => void;
  'category:updated': (category: any) => void;
  'category:deleted': (data: { categoryId: string }) => void;
  
  // Admin events
  'admin:message': (message: any) => void;
  'admin:notification': (notification: any) => void;
  'admin:connected': (data: { adminId: string }) => void;
  'admin:disconnected': (data: { adminId: string }) => void;
  
  // Connection events
  'connect': () => void;
  'disconnect': (reason: string) => void;
  'connect_error': (error: Error) => void;
}

class ComprehensiveWebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, ((...args: any[]) => void)[]> = new Map();
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error' = 'disconnected';
  private baseUrl: string;
  private authToken: string | null = null;
  private userId: string | null = null;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  // Initialize comprehensive WebSocket connection
  async connect(userToken?: string): Promise<void> {
    if (this.connectionStatus === 'connected') {
      console.log('📱 Comprehensive WebSocket already connected');
      return;
    }

    try {
      if (!userToken) {
        userToken = await AsyncStorage.getItem('userToken');
      }
      
      // Get user info for better tracking
      const userInfo = await AsyncStorage.getItem('userProfile');
      if (userInfo) {
        this.userId = JSON.parse(userInfo)._id;
      }
      
      this.authToken = userToken;
      this.connectionStatus = 'connecting';

      console.log('🔌 Connecting to Comprehensive WebSocket:', this.baseUrl);

      this.socket = io(this.baseUrl, {
        auth: {
          token: this.authToken,
          clientType: 'client'
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 3000,
        reconnectionDelayMax: 10000,
        maxReconnectionAttempts: 5,
        timeout: 20000,
      });

      this.setupComprehensiveEventHandlers();
      
    } catch (error) {
      console.error('❌ Failed to initialize Comprehensive WebSocket:', error);
      this.connectionStatus = 'error';
      throw error;
    }
  }

  private setupComprehensiveEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Comprehensive WebSocket connected:', this.socket?.id);
      this.connectionStatus = 'connected';
      this.emit('connect');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('💔 Comprehensive WebSocket disconnected:', reason);
      this.connectionStatus = 'disconnected';
      this.emit('disconnect', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('🚨 Comprehensive WebSocket connection error:', error);
      this.connectionStatus = 'error';
      this.emit('connect_error', error);
    });

    // ========================= PRODUCT EVENTS =========================
    this.socket.on('product:created', (data) => {
      console.log('📦 New product created:', data.productTitle);
      this.emit('product:created', data);
    });

    this.socket.on('product:updated', (data) => {
      console.log('📝 Product updated:', data.productTitle);
      this.emit('product:updated', data);
    });

    this.socket.on('product:deleted', (data) => {
      console.log('🗑️ Product deleted:', data.productId);
      this.emit('product:deleted', data);
    });

    // ========================= ORDER EVENTS =========================
    this.socket.on('order:created_update', (data) => {
      console.log('🛒 Order status updated:', data);
      this.storeNotification({
        title: 'Order Updated',
        message: `Your order #${data.orderId} has been updated`,
        type: 'order'
      });
      this.emit('order:created_update', data);
    });

    this.socket.on('order:status_updated', (data) => {
      console.log('📋 Order status changed:', data);
      this.storeNotification({
        title: 'Order Status Change',
        message: data.message,
        type: 'order'
      });
      this.emit('order:status_updated', data);
    });

    // ========================= NOTIFICATION EVENTS =========================
    this.socket.on('notification:created', (data) => {
      console.log('🔔 New notification:', data);
      this.storeNotification(data);
      this.emit('notification:created', data);
    });

    this.socket.on('notification:broadcast', (data) => {
      console.log('📢 Broadcast notification:', data);
      this.storeNotification(data);
      this.emit('notification:broadcast', data);
    });

    // ========================= WALLET EVENTS =========================
    this.socket.on('wallet:balance_updated', (data) => {
      console.log('💰 Wallet balance updated:', data);
      this.storeNotification({
        title: 'Wallet Updated',
        message: `Your wallet balance is now ₹${data.newBalance}`,
        type: 'wallet'
      });
      this.emit('wallet:balance_updated', data);
    });

    // ========================= TRANSACTION EVENTS =========================
    this.socket.on('transaction:created', (data) => {
      console.log('💳 New transaction:', data);
      this.storeNotification({
        title: 'Transaction Created',
        message: `Transaction of ₹${data.amount} ${data.type}`,
        type: 'transaction'
      });
      this.emit('transaction:created', data);
    });

    this.socket.on('transaction:status_updated', (data) => {
      console.log('💳 Transaction status updated:', data);
      this.storeNotification({
        title: 'Transaction Update',
        message: data.message,
        type: 'transaction'
      });
      this.emit('transaction:status_updated', data);
    });

    // ========================= CART EVENTS =========================
    this.socket.on('cart:item_added', (data) => {
      console.log('🛒 Item added to cart:', data);
      this.emit('cart:item_added', data);
    });

    this.socket.on('cart:item_updated', (data) => {
      console.log('🛒 Cart item updated:', data);
      this.emit('cart:item_updated', data);
    });

    this.socket.on('cart:item_removed', (data) => {
      console.log('🛒 Item removed from cart:', data);
      this.emit('cart:item_removed', data);
    });

    // ========================= REVIEW EVENTS =========================
    this.socket.on('review:created', (data) => {
      console.log('⭐ New review added:', data);
      this.emit('review:created', data);
    });

    // ========================= FAQ EVENTS =========================
    this.socket.on('faq:created', (data) => {
      console.log('❓ New FAQ added:', data);
      this.emit('faq:created', data);
    });

    // ========================= CATEGORY EVENTS =========================
    this.socket.on('category:created', (data) => {
      console.log('📂 New category added:', data);
      this.emit('category:created', data);
    });

    this.socket.on('category:updated', (data) => {
      console.log('📂 Category updated:', data);
      this.emit('category:updated', data);
    });

    // ========================= ADMIN EVENTS =========================
    this.socket.on('admin:message', (data) => {
      console.log('👑 Message from admin:', data);
      this.storeNotification({
        title: 'Message from Support',
        message: data.message,
        type: 'admin'
      });
      this.emit('admin:message', data);
    });

    this.socket.on('admin:notification', (data) => {
      console.log('📢 Admin notification:', data);
      this.storeNotification(data);
      this.emit('admin:notification', data);
    });
  }

  // ========================= EMIT METHODS FOR USER ACTIONS =========================

  // Product interactions
  emitProductView(productId: string): void {
    this.safeEmit('product:view', { productId });
  }

  emitProductSearch(query: string): void {
    this.safeEmit('product:search', { query });
  }

  emitAddToWishlist(productId: string): void {
    this.safeEmit('product:add_to_wishlist', { productId });
  }

  // Order interactions
  emitOrderCreate(orderData: any): void {
    this.safeEmit('order:create', orderData);
  }

  emitOrderTrack(orderId: string): void {
    this.safeEmit('order:track', { orderId });
  }

  emitOrderCancelRequest(orderId: string, reason: string): void {
    this.safeEmit('order:cancel_request', { orderId, reason });
  }

  // Notification interactions
  emitNotificationRead(notificationId: string): void {
    this.safeEmit('notification:read', { notificationId });
  }

  emitNotificationSubscribe(type: string): void {
    this.safeEmit('notification:subscribe', { type });
  }

  // Wallet interactions
  emitWalletBalanceRequest(): void {
    this.safeEmit('wallet:balance_request', {});
  }

  emitWalletAddMoney(amount: number, paymentMethod: string): void {
    this.safeEmit('wallet:add_money', { amount, paymentMethod });
  }

  // Transaction interactions
  emitTransactionInitiate(transactionData: any): void {
    this.safeEmit('transaction:initiate', transactionData);
  }

  // Cart interactions
  emitCartAddItem(productId: string, quantity: number): void {
    this.safeEmit('cart:add_item', { productId, quantity });
  }

  emitCartRemoveItem(productId: string): void {
    this.safeEmit('cart:remove_item', { productId });
  }

  emitCartCheckoutStart(total: number, itemCount: number): void {
    this.safeEmit('cart:checkout_start', { total, itemCount });
  }

  // User interactions
  emitProfileUpdate(changes: any): void {
    this.safeEmit('user:profile_update', { changes });
  }

  emitSupportRequest(subject: string, message: string, priority: string = 'normal'): void {
    this.safeEmit('user:support_request', { subject, message, priority });
  }

  // Review interactions
  emitReviewSubmit(productId: string, rating: number, comment: string): void {
    this.safeEmit('review:submit', { productId, rating, comment });
  }

  // FAQ interactions
  emitFAQQuestion(question: string, category: string): void {
    this.safeEmit('faq:question', { question, category });
  }

  // Category interactions
  emitCategoryBrowse(categoryId: string, categoryName: string): void {
    this.safeEmit('category:browse', { categoryId, categoryName });
  }

  // ========================= UTILITY METHODS =========================

  private safeEmit(event: string, data: any): void {
    if (this.isConnected()) {
      this.socket?.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit ${event}: WebSocket not connected`);
    }
  }

  private async storeNotification(notification: any): Promise<void> {
    try {
      const existingNotifications = await AsyncStorage.getItem('all_notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      
      notifications.unshift({
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false
      });

      // Keep only last 100 notifications
      const limitedNotifications = notifications.slice(0, 100);
      
      await AsyncStorage.setItem('all_notifications', JSON.stringify(limitedNotifications));
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  // Event subscription methods
  on<K extends keyof ComprehensiveWebSocketEvents>(event: K, callback: ComprehensiveWebSocketEvents[K]): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(callback);
  }

  off<K extends keyof ComprehensiveWebSocketEvents>(event: K, callback?: ComprehensiveWebSocketEvents[K]): void {
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
    userId: string | null;
  } {
    return {
      status: this.connectionStatus,
      socketId: this.socket?.id,
      connected: this.isConnected(),
      userId: this.userId
    };
  }

  // Get all stored notifications
  async getAllNotifications(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('all_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting Comprehensive WebSocket');
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus = 'disconnected';
    this.eventHandlers.clear();
  }
}

// Create and export singleton instance
export const comprehensiveWebSocketService = new ComprehensiveWebSocketService();

export default ComprehensiveWebSocketService;