import { Router } from 'express';
import { loginUser, logOutUser, registerUser } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)

router.use(verifyJWT);

// This route is protected, it requires a valid JWT token to access the resource.
router.route('/logout').post( verifyJWT, logOutUser);



//-------------------------- Admin Routes -----------------------------//



export default router;