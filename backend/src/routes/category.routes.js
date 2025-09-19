import express from 'express';
import { 
    createCategory,
    getAllCategories,
    updateCategory,
    getCategoryById,
    deleteCategory,
    getProductsByCategoryId,
    createAttributeForCategory,
    deleteAttributeFromCategory 
} from '../controllers/category.controller.js';
import { isAdmin, verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/categories').get(getAllCategories);
router.route('/categories/:id/products').get(getProductsByCategoryId);
router.route('/categories/:id').get(getCategoryById);


//---------------------------- Admin Routes ----------------------------//

router.route('/admin/categories').post(verifyJWT, isAdmin, createCategory);
router.route('/admin/categories/:id').delete(verifyJWT, isAdmin, deleteCategory);
router.route('/admin/categories/:id').put(verifyJWT, isAdmin, updateCategory);
router.route('/admin/categories/:id/attributes').post(verifyJWT, isAdmin, createAttributeForCategory);
router.route('/admin/categories/:id/attributes').delete(verifyJWT, isAdmin, deleteAttributeFromCategory);



export default router;