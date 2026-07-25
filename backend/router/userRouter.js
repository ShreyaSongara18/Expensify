const express = require('express');
const { 
    loginController, 
    logoutController, 
    signupContorller, 
    updateProfileController, 
    changePasswordController, 
    forgotPasswordController, 
    resetPasswordController 
} = require('../controller/userController');
const router = express.Router();

router.post('/login' ,loginController);
router.get('/logout', logoutController);
router.post('/signup', signupContorller);
router.post('/updateProfile', updateProfileController);
router.post('/changePassword', changePasswordController);
router.post('/forgotPassword', forgotPasswordController);
router.post('/resetPassword', resetPasswordController);

module.exports = router;