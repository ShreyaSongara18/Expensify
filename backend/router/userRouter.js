const express = require('express');
const { 
    loginController, 
    logoutController, 
    signupController, 
    updateProfileController, 
    changePasswordController, 
    forgotPasswordController, 
    resetPasswordController 
} = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login' ,loginController);
router.get('/logout', logoutController);
router.post('/signup', signupController);
router.post('/updateProfile', authMiddleware, updateProfileController);
router.post('/changePassword', authMiddleware, changePasswordController);
router.post('/forgotPassword', forgotPasswordController);
router.post('/resetPassword', resetPasswordController);

module.exports = router;