// Backend Axios Configuration for Internal API Calls
import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 8000}`;

// Create axios instances for different purposes
export const internalAPI = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'GeekLappy-Internal-API',
  }
});

// Admin API instance (for AdminJS custom components)
export const adminAPI = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Request': 'true',
  }
});

// External services API instance
export const externalAPI = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'GeekLappy-External-Client',
  }
});

// Request interceptors
internalAPI.interceptors.request.use(
  (config) => {
    // Add internal authentication token if needed
    if (process.env.INTERNAL_API_KEY) {
      config.headers['X-Internal-Key'] = process.env.INTERNAL_API_KEY;
    }
    
    // Add timestamp for logging
    config.metadata = { startTime: new Date() };
    console.log(`🔄 Internal API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🚨 Internal API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptors
internalAPI.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`✅ Internal API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
    console.error(`❌ Internal API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`, error.message);
    return Promise.reject(error);
  }
);

// Admin API interceptors
adminAPI.interceptors.request.use(
  (config) => {
    // Add admin session/token if available
    const adminToken = global.adminSession?.token; // You can set this from AdminJS session
    if (adminToken) {
      config.headers['Authorization'] = `Bearer ${adminToken}`;
    }
    
    config.metadata = { startTime: new Date() };
    console.log(`👑 Admin API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🚨 Admin API Request Error:', error);
    return Promise.reject(error);
  }
);

adminAPI.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`👑✅ Admin API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
    console.error(`👑❌ Admin API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`, error.message);
    return Promise.reject(error);
  }
);

// External API interceptors
externalAPI.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    console.log(`🌐 External API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🚨 External API Request Error:', error);
    return Promise.reject(error);
  }
);

externalAPI.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`🌐✅ External API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
    console.error(`🌐❌ External API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`, error.message);
    return Promise.reject(error);
  }
);

// Utility functions for common operations
export const apiHelpers = {
  // Get product data for internal use
  async getProductData(productId) {
    try {
      const response = await internalAPI.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get product data:', error.message);
      throw error;
    }
  },

  // Update product stock internally
  async updateProductStock(productId, quantity) {
    try {
      const response = await internalAPI.patch(`/products/${productId}/stock`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Failed to update product stock:', error.message);
      throw error;
    }
  },

  // Admin-specific operations
  async adminGetAnalytics() {
    try {
      const response = await adminAPI.get('/dashboard/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to get admin analytics:', error.message);
      throw error;
    }
  },

  // Bulk operations
  async bulkUpdateProducts(updates) {
    try {
      const response = await adminAPI.post('/products/bulk-update', { updates });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update products:', error.message);
      throw error;
    }
  },

  // External service calls
  async validatePayment(paymentData) {
    try {
      const response = await externalAPI.post('https://api.payment-gateway.com/validate', paymentData);
      return response.data;
    } catch (error) {
      console.error('Failed to validate payment:', error.message);
      throw error;
    }
  }
};

// Health check function
export const checkAPIHealth = async () => {
  try {
    const response = await internalAPI.get('/health');
    return {
      status: 'healthy',
      timestamp: new Date(),
      responseTime: response.headers['x-response-time'],
      data: response.data
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date(),
      error: error.message
    };
  }
};

export default {
  internalAPI,
  adminAPI,
  externalAPI,
  apiHelpers,
  checkAPIHealth
};