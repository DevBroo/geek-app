import { Router } from 'express';
import { 
    registerUser, 
    loginUser, 
    logOutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateProfilePicture 
 } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Public routes
router.route('/register').post(
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
  ]),
  registerUser
);
router.route('/login').post(loginUser);
router.route('/refresh-token').get(refreshAccessToken);

// Protected routes (JWT required)
router.use(verifyJWT);
router.route('/logout').post(logOutUser);
router.route('/change-password').put(changeCurrentPassword);
router.route('/me').get(getCurrentUser);
router.route('/update-account').put(updateAccountDetails);
router.route('/update-profile-picture').put(
  upload.single('profilePicture'),
  updateProfilePicture
);

//-------------------------- Admin Routes -----------------------------//

export default router;