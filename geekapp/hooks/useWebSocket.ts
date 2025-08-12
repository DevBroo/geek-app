// React Hook for WebSocket Integration
import { useEffect, useState, useCallback, useRef } from 'react';
import { webSocketService } from '../services/websocketService';
import { productService } from '../services/productService';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
}

interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { autoConnect = true, reconnectOnMount = true } = options;
  
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const mountedRef = useRef(true);

  // Update state helper
  const updateState = useCallback((updates: Partial<WebSocketState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Connection management
  const connect = useCallback(async () => {
    if (state.connected || state.connecting) return;
    
    updateState({ connecting: true, error: null });
    
    try {
      await webSocketService.connect();
    } catch (error) {
      updateState({ 
        connecting: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      });
    }
  }, [state.connected, state.connecting, updateState]);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  const reconnect = useCallback(async () => {
    disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await connect();
  }, [connect, disconnect]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const storedNotifications = await webSocketService.getNotifications();
      if (mountedRef.current) {
        setNotifications(storedNotifications);
        setUnreadCount(storedNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await webSocketService.markNotificationRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [loadNotifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await webSocketService.clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, []);

  // Event handlers
  useEffect(() => {
    const handleConnect = () => {
      updateState({ 
        connected: true, 
        connecting: false, 
        error: null, 
        reconnectAttempts: 0 
      });
    };

    const handleDisconnect = (reason: string) => {
      updateState({ 
        connected: false, 
        connecting: false, 
        error: `Disconnected: ${reason}` 
      });
    };

    const handleConnectError = (error: Error) => {
      updateState({ 
        connected: false, 
        connecting: false, 
        error: error.message,
        reconnectAttempts: webSocketService.getConnectionStatus().reconnectAttempts
      });
    };

    const handleProductNew = (product: any) => {
      console.log('🆕 New product available:', product.productTitle);
      // You can show a toast or update UI here
    };

    const handleProductUpdated = (product: any) => {
      console.log('📝 Product updated:', product.productTitle);
      // Invalidate cache to show updated data
      productService.invalidateProductCache(product._id);
    };

    const handleProductDeleted = (data: { productId: string }) => {
      console.log('🗑️ Product deleted:', data.productId);
      productService.invalidateProductCache(data.productId);
    };

    const handleAdminNotification = (notification: any) => {
      console.log('📢 Admin notification:', notification);
      loadNotifications();
    };

    const handleOrderStatusUpdate = (order: any) => {
      console.log('📦 Order status updated:', order);
      // You can show push notification or update order status
    };

    // Subscribe to WebSocket events
    webSocketService.on('connect', handleConnect);
    webSocketService.on('disconnect', handleDisconnect);
    webSocketService.on('connect_error', handleConnectError);
    webSocketService.on('product:new', handleProductNew);
    webSocketService.on('product:updated', handleProductUpdated);
    webSocketService.on('product:deleted', handleProductDeleted);
    webSocketService.on('admin:notification', handleAdminNotification);
    webSocketService.on('order:status_update', handleOrderStatusUpdate);

    // Load initial notifications
    loadNotifications();

    // Cleanup function
    return () => {
      webSocketService.off('connect', handleConnect);
      webSocketService.off('disconnect', handleDisconnect);
      webSocketService.off('connect_error', handleConnectError);
      webSocketService.off('product:new', handleProductNew);
      webSocketService.off('product:updated', handleProductUpdated);
      webSocketService.off('product:deleted', handleProductDeleted);
      webSocketService.off('admin:notification', handleAdminNotification);
      webSocketService.off('order:status_update', handleOrderStatusUpdate);
    };
  }, [updateState, loadNotifications]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (reconnectOnMount) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, reconnectOnMount]);

  return {
    // Connection state
    ...state,
    
    // Connection methods
    connect,
    disconnect,
    reconnect,
    
    // Notifications
    notifications,
    unreadCount,
    markNotificationRead,
    clearAllNotifications,
    
    // Utility methods
    emitProductView: webSocketService.emitProductView.bind(webSocketService),
    emitProductSearch: webSocketService.emitProductSearch.bind(webSocketService),
    emitOrderCreated: webSocketService.emitOrderCreated.bind(webSocketService),
    
    // Status
    getConnectionStatus: () => webSocketService.getConnectionStatus(),
    isConnected: () => webSocketService.isConnected(),
  };
};

// Hook for specific WebSocket events
export const useWebSocketEvent = <T = any>(
  event: string, 
  handler: (data: T) => void,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    webSocketService.on(event, handler);
    
    return () => {
      webSocketService.off(event, handler);
    };
  }, deps);
};

// Hook for real-time product updates
export const useRealTimeProducts = () => {
  const [updates, setUpdates] = useState<{
    new: any[];
    updated: any[];
    deleted: string[];
  }>({
    new: [],
    updated: [],
    deleted: []
  });

  useWebSocketEvent('product:new', (product: any) => {
    setUpdates(prev => ({
      ...prev,
      new: [product, ...prev.new].slice(0, 10) // Keep last 10
    }));
  });

  useWebSocketEvent('product:updated', (product: any) => {
    setUpdates(prev => ({
      ...prev,
      updated: [product, ...prev.updated].slice(0, 10)
    }));
  });

  useWebSocketEvent('product:deleted', (data: { productId: string }) => {
    setUpdates(prev => ({
      ...prev,
      deleted: [data.productId, ...prev.deleted].slice(0, 10)
    }));
  });

  const clearUpdates = useCallback(() => {
    setUpdates({ new: [], updated: [], deleted: [] });
  }, []);

  return {
    ...updates,
    clearUpdates,
    hasUpdates: updates.new.length > 0 || updates.updated.length > 0 || updates.deleted.length > 0
  };
};