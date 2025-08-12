// Enhanced Product Service with Caching and Error Handling
import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache keys
const CACHE_KEYS = {
  PRODUCTS: 'products_cache',
  CATEGORIES: 'categories_cache',
  PRODUCT_DETAILS: (id: string) => `product_${id}_cache`,
};

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export interface Product {
  _id: string;
  productTitle: string;
  productDescription: string;
  originalPrice: number;
  discountPercentage: number;
  quantity: number;
  isAvailable: boolean;
  productImage: Array<{
    public_id: string;
    url: string;
  }>;
  category: {
    _id: string;
    name: string;
  };
  brand: string;
  warranty: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class ProductService {
  // Cache helpers
  private async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  }

  private async setCacheData<T>(key: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  // Get all products with caching and filters
  async getAllProducts(params: {
    keyword?: string;
    category?: string;
    page?: number;
    limit?: number;
    sortBy?: 'price' | 'name' | 'date';
    order?: 'asc' | 'desc';
  } = {}): Promise<ProductsResponse> {
    try {
      // Check cache first (only if no filters)
      if (!params.keyword && !params.category) {
        const cached = await this.getCachedData<ProductsResponse>(CACHE_KEYS.PRODUCTS);
        if (cached) {
          console.log('📱 Using cached products data');
          return cached;
        }
      }

      console.log('🌐 Fetching products from API...');
      const response: AxiosResponse<ProductsResponse> = await apiClient.get('/products', { params });
      
      // Cache the response (only if no filters)
      if (!params.keyword && !params.category) {
        await this.setCacheData(CACHE_KEYS.PRODUCTS, response.data);
      }
      
      return response.data;
    } catch (error) {
      // Return cached data as fallback
      const cached = await this.getCachedData<ProductsResponse>(CACHE_KEYS.PRODUCTS);
      if (cached) {
        console.log('📱 Using cached data as fallback');
        return cached;
      }
      
      throw this.handleError(error);
    }
  }

  // Get product by ID with caching
  async getProductById(id: string): Promise<{ success: boolean; data: Product }> {
    try {
      // Check cache first
      const cached = await this.getCachedData<Product>(CACHE_KEYS.PRODUCT_DETAILS(id));
      if (cached) {
        console.log(`📱 Using cached product data for ${id}`);
        return { success: true, data: cached };
      }

      console.log(`🌐 Fetching product ${id} from API...`);
      const response = await apiClient.get(`/products/${id}`);
      
      // Cache the product
      await this.setCacheData(CACHE_KEYS.PRODUCT_DETAILS(id), response.data.data);
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get top rated products
  async getTopProducts(): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get('/products/top');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search products with debouncing
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  
  async searchProducts(
    keyword: string,
    callback: (results: ProductsResponse) => void,
    debounceMs: number = 500
  ): Promise<void> {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(async () => {
      try {
        const results = await this.getAllProducts({ keyword });
        callback(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }, debounceMs);
  }

  // Clear cache when data might be stale
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.includes('_cache') || key.includes('product_')
      );
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('🗑️ Cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Invalidate specific cache
  async invalidateProductCache(productId?: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.PRODUCTS);
      if (productId) {
        await AsyncStorage.removeItem(CACHE_KEYS.PRODUCT_DETAILS(productId));
      }
    } catch (error) {
      console.warn('Failed to invalidate cache:', error);
    }
  }

  // Error handler
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 'Server error occurred';
        return new Error(message);
      } else if (error.request) {
        // Request was made but no response
        return new Error('Network error - please check your connection');
      }
    }
    
    return new Error('An unexpected error occurred');
  }
}

// Export singleton instance
export const productService = new ProductService();

// Also export for dependency injection
export default ProductService;