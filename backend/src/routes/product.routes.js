import express from 'express';
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { createProduct, deleteProductById, getAllProducts, updateProductById, getProductById, updateProductImages, deleteProductImage, getTopProducts, updateStockOfProduct,updateSoldCountOfProduct, updateLikesOfProduct, uploadProductImages } from '../controllers/product.controller.js';
import { getCacheStats, clearAllCaches } from '../controllers/optimized-product.controller.js';
import { Product } from '../models/products.model.js';

const router = express.Router();


//-------------------------- User Routes -----------------------------//

router.route('/').get(verifyJWT, getAllProducts);
router.route('/:productId').get(verifyJWT, getProductById);
router.route('/top-products').get(verifyJWT, getTopProducts);


//-------------------------- Admin Routes -----------------------------//

router.route('/admin/products').post(verifyJWT, isAdmin, createProduct);
router.route('/admin/products/:productId/images').post(verifyJWT, isAdmin, uploadProductImages);
router.route('/admin/products/:productId').put(verifyJWT, isAdmin, updateProductById);
router.route('/admin/products/:productId/images').delete(verifyJWT, isAdmin, deleteProductImage);
router.route('/admin/products/:productId/stock').patch(verifyJWT, isAdmin, updateStockOfProduct);
router.route('/admin/products/:productId/sold').patch(verifyJWT, isAdmin, updateSoldCountOfProduct);
router.route('/admin/products/:productId/likes').patch(verifyJWT, isAdmin, updateLikesOfProduct);
router.route('/admin/products/:productId').delete(verifyJWT, isAdmin, deleteProductById);

// Add new admin routes
router.get('/cache/stats', getCacheStats);      // GET /api/v1/products/cache/stats
router.delete('/cache/clear', clearAllCaches);  // DELETE /api/v1/products/cache/clear


export default router;