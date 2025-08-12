// Custom React Hook for Product Management
import { useState, useEffect, useCallback } from 'react';
import { productService, Product, ProductsResponse } from '../services/productService';

interface UseProductsOptions {
  keyword?: string;
  category?: string;
  autoLoad?: boolean;
  enableCache?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: any;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  searchProducts: (keyword: string) => Promise<void>;
  clearError: () => void;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const { keyword = '', category = '', autoLoad = true, enableCache = true } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async (page: number = 1, reset: boolean = true) => {
    if (reset) setLoading(true);
    setError(null);

    try {
      const response = await productService.getAllProducts({
        keyword,
        category,
        page,
        limit: 10,
      });

      if (reset) {
        setProducts(response.data);
      } else {
        setProducts(prev => [...prev, ...response.data]);
      }
      
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [keyword, category]);

  const refetch = useCallback(async () => {
    setCurrentPage(1);
    await fetchProducts(1, true);
  }, [fetchProducts]);

  const loadMore = useCallback(async () => {
    if (pagination && currentPage < pagination.pages) {
      await fetchProducts(currentPage + 1, false);
    }
  }, [fetchProducts, pagination, currentPage]);

  const searchProducts = useCallback(async (searchKeyword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productService.getAllProducts({
        keyword: searchKeyword,
        page: 1,
        limit: 10,
      });
      
      setProducts(response.data);
      setPagination(response.pagination);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoLoad) {
      fetchProducts();
    }
  }, [fetchProducts, autoLoad]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    searchProducts,
    clearError,
  };
};

// Hook for single product
interface UseProductOptions {
  productId: string;
  autoLoad?: boolean;
}

interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useProduct = (options: UseProductOptions): UseProductReturn => {
  const { productId, autoLoad = true } = options;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getProductById(productId);
      setProduct(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoLoad && productId) {
      fetchProduct();
    }
  }, [fetchProduct, autoLoad, productId]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
    clearError,
  };
};

// Hook for top products
export const useTopProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getTopProducts();
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchTopProducts,
    clearError: () => setError(null),
  };
};