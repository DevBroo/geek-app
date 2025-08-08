import express from 'express';
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { createProduct, deleteProductById, getAllProducts, updateProductById, getProductById, updateProductImages, deleteProductImage, getTopProducts, updateStockOfProduct,updateSoldCountOfProduct, updateLikesOfProduct } from '../controllers/product.controller.js';
import { getCacheStats, clearAllCaches } from '../controllers/optimized-product.controller.js';

const router = express.Router();


//-------------------------- User Routes -----------------------------//

router.route('/').get(verifyJWT, getAllProducts);
router.route('/product/:productId').get(verifyJWT, getProductById);
router.route('/top-products').get(verifyJWT, getTopProducts);


//-------------------------- Admin Routes -----------------------------//

router.route('admin/products/create-product').post(verifyJWT, isAdmin, createProduct);

router.route('admin/products/update-product/:productId').put(isAdmin, verifyJWT, updateProductById, updateProductImages);

router.route('admin/products/delete-product/:productId').delete(isAdmin, verifyJWT, deleteProductById, deleteProductImage);

router.route('admin/products/update-stock-of-product/:productId').patch(isAdmin, verifyJWT, updateStockOfProduct);

router.route('admin/products/update-sold-count-of-product/:productId').patch(isAdmin, verifyJWT, updateSoldCountOfProduct);

router.route('admin/products/update-likes-of-product/:productId').patch(isAdmin, verifyJWT, updateLikesOfProduct);

// Add new admin routes
router.get("/cache/stats", getCacheStats);      // GET /api/products/cache/stats
router.delete("/cache/clear", clearAllCaches);  // DELETE /api/products/cache/clear


export default router;