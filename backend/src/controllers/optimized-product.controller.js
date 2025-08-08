import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/products.model.js";
import { Category } from "../models/category.model.js";
import { cloudinary, uploadImageCloudinary } from "../utils/cloudinary.service.js";
import NodeCache from 'node-cache';

// Initialize cache with TTL of 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

// Cache keys
const CACHE_KEYS = {
  ALL_PRODUCTS: 'all_products',
  TOP_PRODUCTS: 'top_products',
  PRODUCT_BY_ID: (id) => `product_${id}`,
  PRODUCTS_BY_CATEGORY: (category) => `products_category_${category}`,
};

// Enhanced get all products with caching, filtering, sorting, and pagination
const getAllProducts = asyncHandler(async (req, res) => {
  const { 
    keyword = '', 
    category = '', 
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt', 
    order = 'desc',
    minPrice,
    maxPrice,
    inStock
  } = req.query;

  try {
    // Create cache key based on query parameters
    const cacheKey = `products_${JSON.stringify(req.query)}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('📦 Serving from cache');
      return res.status(200).json(new ApiResponse(200, true, 'Products fetched successfully (cached)', cached.data, cached.pagination));
    }

    // Build query
    let query = {};
    
    // Search by keyword (product title or description)
    if (keyword) {
      query.$or = [
        { productTitle: { $regex: keyword, $options: 'i' } },
        { productDescription: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      // If category is ObjectId, use it directly, otherwise find by name
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ 
          name: { $regex: category, $options: 'i' } 
        });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.originalPrice = {};
      if (minPrice) query.originalPrice.$gte = Number(minPrice);
      if (maxPrice) query.originalPrice.$lte = Number(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query.quantity = { $gt: 0 };
      query.isAvailable = true;
    }

    // Build sort object
    let sortObject = {};
    switch (sortBy) {
      case 'price':
        sortObject.originalPrice = order === 'asc' ? 1 : -1;
        break;
      case 'name':
        sortObject.productTitle = order === 'asc' ? 1 : -1;
        break;
      case 'date':
      default:
        sortObject.createdAt = order === 'asc' ? 1 : -1;
        break;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with population
    const products = await Product.find(query)
      .populate('category', 'name description')
      .populate('user', 'fullName email')
      .populate({
        path: 'review',
        select: 'rating comment user',
        populate: {
          path: 'user',
          select: 'fullName'
        }
      })
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Use lean for better performance

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / Number(limit));

    // Calculate final prices with discounts
    const productsWithCalculatedPrices = products.map(product => ({
      ...product,
      finalPrice: product.originalPrice - (product.originalPrice * product.discountPercentage / 100),
      averageRating: product.review?.length > 0 
        ? product.review.reduce((sum, r) => sum + r.rating, 0) / product.review.length 
        : 0,
      totalReviews: product.review?.length || 0
    }));

    const pagination = {
      total: totalProducts,
      page: Number(page),
      limit: Number(limit),
      pages: totalPages,
      hasNext: Number(page) < totalPages,
      hasPrev: Number(page) > 1
    };

    // Cache the result
    cache.set(cacheKey, { 
      data: productsWithCalculatedPrices, 
      pagination 
    });

    return res.status(200).json(
      new ApiResponse(200, true, 'Products fetched successfully', productsWithCalculatedPrices, pagination)
    );

  } catch (error) {
    console.error("Error while fetching products:", error);
    throw new ApiError(500, "Error while fetching products");
  }
});

// Enhanced get product by ID with caching
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const cacheKey = CACHE_KEYS.PRODUCT_BY_ID(id);
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('📦 Serving product from cache');
      return res.status(200).json(new ApiResponse(200, true, 'Product fetched successfully (cached)', cached));
    }

    const product = await Product.findById(id)
      .populate('category', 'name description')
      .populate('user', 'fullName email')
      .populate({
        path: 'review',
        select: 'rating comment user createdAt',
        populate: {
          path: 'user',
          select: 'fullName avatar'
        }
      })
      .lean();

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Calculate additional fields
    const productWithCalculations = {
      ...product,
      finalPrice: product.originalPrice - (product.originalPrice * product.discountPercentage / 100),
      averageRating: product.review?.length > 0 
        ? product.review.reduce((sum, r) => sum + r.rating, 0) / product.review.length 
        : 0,
      totalReviews: product.review?.length || 0,
      savingsAmount: product.originalPrice * product.discountPercentage / 100
    };

    // Cache the result
    cache.set(cacheKey, productWithCalculations);

    return res.status(200).json(
      new ApiResponse(200, true, 'Product fetched successfully', productWithCalculations)
    );

  } catch (error) {
    console.error("Error while fetching product:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error while fetching product");
  }
});

// Enhanced get top products with caching
const getTopProducts = asyncHandler(async (req, res) => {
  try {
    const cacheKey = CACHE_KEYS.TOP_PRODUCTS;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('📦 Serving top products from cache');
      return res.status(200).json(new ApiResponse(200, true, 'Top products fetched successfully (cached)', cached));
    }

    // Aggregation pipeline for top rated products
    const topProducts = await Product.aggregate([
      {
        $lookup: {
          from: 'reviewsandratings',
          localField: 'review',
          foreignField: '_id',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $avg: '$reviews.rating' },
              else: 0
            }
          },
          totalReviews: { $size: '$reviews' }
        }
      },
      {
        $match: {
          averageRating: { $gte: 4.0 },
          isAvailable: true,
          quantity: { $gt: 0 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $addFields: {
          finalPrice: {
            $subtract: [
              '$originalPrice',
              { $multiply: ['$originalPrice', { $divide: ['$discountPercentage', 100] }] }
            ]
          }
        }
      },
      {
        $sort: { averageRating: -1, totalReviews: -1 }
      },
      {
        $limit: 6
      },
      {
        $project: {
          reviews: 0 // Don't send all reviews in the response
        }
      }
    ]);

    if (!topProducts.length) {
      throw new ApiError(404, 'No top products found');
    }

    // Cache the result
    cache.set(cacheKey, topProducts);

    return res.status(200).json(
      new ApiResponse(200, true, 'Top products fetched successfully', topProducts)
    );

  } catch (error) {
    console.error("Error while fetching top products:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error while fetching top products");
  }
});

// Cache invalidation helpers
const invalidateProductCaches = (productId = null) => {
  // Clear general caches
  cache.del(CACHE_KEYS.ALL_PRODUCTS);
  cache.del(CACHE_KEYS.TOP_PRODUCTS);
  
  // Clear specific product cache
  if (productId) {
    cache.del(CACHE_KEYS.PRODUCT_BY_ID(productId));
  }
  
  // Clear all product-related caches (search results, category filters, etc.)
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.startsWith('products_')) {
      cache.del(key);
    }
  });
};

// Enhanced create product with cache invalidation
const createProduct = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to perform this action');
  }

  try {
    const { 
      productTitle, 
      productDescription, 
      originalPrice, 
      discountPercentage = 0,
      quantity, 
      productImage: base64Images, 
      category, 
      warranty, 
      brand,
      bulkThreshold = 0,
      additionalBulkDiscountPercentage = 0
    } = req.body;

    // Validation (same as before but condensed)
    if (!productTitle || !productDescription || !originalPrice || !quantity || !category || !warranty || !brand) {
      throw new ApiError(400, "Please fill all required fields");
    }

    // Upload images if provided
    let uploadedImageDetails = [];
    if (base64Images && Array.isArray(base64Images) && base64Images.length > 0) {
      for (const base64Data of base64Images) {
        try {
          const result = await uploadImageCloudinary(base64Data);
          uploadedImageDetails.push(result);
        } catch (uploadError) {
          console.error(`Failed to upload image: ${uploadError.message}`);
          throw new ApiError(500, "Failed to upload one or more images");
        }
      }
    }

    const product = await Product.create({
      productTitle,
      productDescription,
      originalPrice,
      discountPercentage,
      bulkThreshold,
      additionalBulkDiscountPercentage,
      quantity,
      productImage: uploadedImageDetails,
      category,
      warranty,
      brand,
      user: req.user._id,
      isAvailable: quantity > 0
    });

    // Populate the created product for response
    await product.populate('category', 'name');
    await product.populate('user', 'fullName email');

    // Invalidate caches
    invalidateProductCaches();

    return res.status(201).json(
      new ApiResponse(201, true, "Product created successfully", product)
    );

  } catch (error) {
    console.error("Error while creating product:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error while creating product");
  }
});

// Enhanced update product with cache invalidation
const updateProductById = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to perform this action');
  }

  try {
    const { id } = req.params;
    
    // Auto-update isAvailable based on quantity
    if (req.body.quantity !== undefined) {
      req.body.isAvailable = req.body.quantity > 0;
    }

    const product = await Product.findByIdAndUpdate(
      id, 
      req.body,
      { 
        new: true,
        runValidators: true
      }
    ).populate('category', 'name').populate('user', 'fullName email');

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Invalidate caches
    invalidateProductCaches(id);

    return res.status(200).json(
      new ApiResponse(200, true, 'Product updated successfully', product)
    );

  } catch (error) {
    console.error("Error while updating product:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error while updating product");
  }
});

// Enhanced delete product with cache invalidation
const deleteProductById = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to perform this action');
  }

  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Delete images from cloudinary
    if (product.productImage && product.productImage.length > 0) {
      for (const image of product.productImage) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (error) {
          console.warn(`Failed to delete image ${image.public_id}:`, error);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    // Invalidate caches
    invalidateProductCaches(id);

    return res.status(200).json(
      new ApiResponse(200, true, 'Product deleted successfully')
    );

  } catch (error) {
    console.error("Error while deleting product:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error while deleting product");
  }
});

// Get cache statistics (for admin monitoring)
const getCacheStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  const stats = cache.getStats();
  
  return res.status(200).json(
    new ApiResponse(200, true, 'Cache statistics', {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hits / (stats.hits + stats.misses),
      memory: process.memoryUsage()
    })
  );
});

// Clear all caches (admin only)
const clearAllCaches = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  cache.flushAll();
  
  return res.status(200).json(
    new ApiResponse(200, true, 'All caches cleared')
  );
});

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
  getTopProducts,
  getCacheStats,
  clearAllCaches
};