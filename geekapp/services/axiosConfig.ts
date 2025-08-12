// Frontend Axios Configuration with WebSocket Integration
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { webSocketService } from './websocketService';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instances
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API client (if you need to make admin calls from frontend)
const adminApiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'admin-frontend',
  },
});

// Request interceptors
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add auth token
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add device info
    config.headers = config.headers || {};
    config.headers['X-Client-Platform'] = 'mobile';
    config.headers['X-App-Version'] = '1.0.0'; // Get from app config

    // Add request ID for tracking
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`📱 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('🚨 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const requestId = response.config.headers?.['X-Request-ID'];
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} [${requestId}]`);
    
    // Handle real-time sync if WebSocket is connected
    handleRealTimeSync(response);
    
    return response;
  },
  async (error) => {
    const requestId = error.config?.headers?.['X-Request-ID'];
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} [${requestId}]`, error.message);
    
    // Handle auth errors
    if (error.response?.status === 401) {
      await handleAuthError();
    }

    // Handle network errors with WebSocket fallback
    if (!error.response && webSocketService.isConnected()) {
      console.log('🔄 Network error detected, WebSocket still connected');
      // Could implement fallback mechanisms here
    }

    return Promise.reject(error);
  }
);

// Handle real-time synchronization
function handleRealTimeSync(response: AxiosResponse): void {
  const { method, url } = response.config;
  const data = response.data?.data;

  // Emit WebSocket events based on API calls
  if (method === 'get' && url?.includes('/products/') && !url.includes('/products?')) {
    // Single product view
    const productId = url.split('/products/')[1];
    webSocketService.emitProductView(productId);
  }
  
  if (method === 'get' && url?.includes('/products') && url.includes('keyword=')) {
    // Search products
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const keyword = urlParams.get('keyword');
    if (keyword) {
      webSocketService.emitProductSearch(keyword);
    }
  }
  
  if (method === 'post' && url?.includes('/orders')) {
    // Order created
    webSocketService.emitOrderCreated(data);
  }
}

// Handle authentication errors
async function handleAuthError(): Promise<void> {
  try {
    // Clear stored tokens
    await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userProfile']);
    
    // Disconnect WebSocket
    webSocketService.disconnect();
    
    // Redirect to login (you'll need to implement navigation)
    console.log('🔐 Authentication expired, redirecting to login');
    
    // You can emit a global event or use your navigation system
    // navigationRef.current?.navigate('Login');
    
  } catch (error) {
    console.error('Error handling auth failure:', error);
  }
}

// API helper functions with WebSocket integration
export const apiHelpers = {
  // Products
  async getProducts(params: any = {}) {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  async getProductById(id: string) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  async searchProducts(keyword: string, otherParams: any = {}) {
    const response = await apiClient.get('/products', {
      params: { keyword, ...otherParams }
    });
    return response.data;
  },

  // Orders
  async createOrder(orderData: any) {
    const response = await apiClient.post('/orders', orderData);
    
    // Emit WebSocket event immediately after successful creation
    if (webSocketService.isConnected()) {
      webSocketService.emitOrderCreated(response.data.data);
    }
    
    return response.data;
  },

  async getOrders(params: any = {}) {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  // Categories
  async getCategories() {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // User profile
  async getUserProfile() {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  async updateUserProfile(userData: any) {
    const response = await apiClient.patch('/users/profile', userData);
    return response.data;
  },

  // Cart operations
  async getCart() {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  async addToCart(productId: string, quantity: number) {
    const response = await apiClient.post('/cart/add', { productId, quantity });
    return response.data;
  },

  async updateCartItem(itemId: string, quantity: number) {
    const response = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  async removeFromCart(itemId: string) {
    const response = await apiClient.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  // Wishlist
  async getWishlist() {
    const response = await apiClient.get('/wishlist');
    return response.data;
  },

  async addToWishlist(productId: string) {
    const response = await apiClient.post('/wishlist/add', { productId });
    return response.data;
  },

  async removeFromWishlist(productId: string) {
    const response = await apiClient.delete(`/wishlist/${productId}`);
    return response.data;
  }
};

// Connection health check
export const checkConnectionHealth = async (): Promise<{
  api: boolean;
  websocket: boolean;
  overall: 'healthy' | 'degraded' | 'unhealthy';
}> => {
  let apiHealthy = false;
  let websocketHealthy = webSocketService.isConnected();

  try {
    await apiClient.get('/health', { timeout: 5000 });
    apiHealthy = true;
  } catch (error) {
    console.warn('API health check failed:', error);
  }

  const overall = apiHealthy && websocketHealthy 
    ? 'healthy' 
    : (apiHealthy || websocketHealthy) 
      ? 'degraded' 
      : 'unhealthy';

  return {
    api: apiHealthy,
    websocket: websocketHealthy,
    overall
  };
};

// Initialize WebSocket connection when axios is configured
export const initializeConnection = async (): Promise<void> => {
  try {
    // Connect WebSocket
    await webSocketService.connect();
    
    // Test API connection
    await checkConnectionHealth();
    
    console.log('🔗 Frontend connections initialized');
  } catch (error) {
    console.error('Failed to initialize connections:', error);
  }
};

// Export axios instances for direct use
export { apiClient as default, adminApiClient };

// Connection status monitoring
export const useConnectionStatus = () => {
  // This can be converted to a React hook for real-time status monitoring
  return {
    isConnected: () => webSocketService.isConnected(),
    getStatus: () => webSocketService.getConnectionStatus(),
    reconnect: () => webSocketService.reconnect(),
    checkHealth: checkConnectionHealth
  };
};