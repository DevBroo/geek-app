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

router.route('/Category').get(getAllCategories);
router.route('/Category/:id/Products').get(getProductsByCategoryId);
router.route('Category/:id').get(getCategoryById);


//---------------------------- Admin Routes ----------------------------//

router.route('/admin/Category/create-category').post(verifyJWT, isAdmin, createCategory);
router.route('/admin/Category/:id/delete').delete(verifyJWT, isAdmin,deleteCategory);
router.route('/admin/Category/:id/update').put(verifyJWT, isAdmin, updateCategory);
router.route('/admin/Category/:id/attributes/create').post(verifyJWT, isAdmin, createAttributeForCategory);
router.route('/admin/Category/:id/attributes').delete( verifyJWT, isAdmin, deleteAttributeFromCategory);



export default router;