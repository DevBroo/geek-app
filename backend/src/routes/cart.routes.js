import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getCartItems, addToCart, removeFromCart, deleteItemFromCart, updateCartItemQuantity, clearCart } from '../controllers/cart.controller.js';

const router = Router();

router.get('/cart-items', verifyJWT, getCartItems);
router.post('/add-to-cart', verifyJWT, addToCart);
router.delete('/remove-from-cart/:cartItemId', verifyJWT, removeFromCart);
router.delete('/:cartItemId', verifyJWT, deleteItemFromCart);
router.put('/update-quantity/:cartItemId/quantity/:quantity', verifyJWT, updateCartItemQuantity);
router.delete('/cart-items/clear-all', verifyJWT, clearCart);

export default router;