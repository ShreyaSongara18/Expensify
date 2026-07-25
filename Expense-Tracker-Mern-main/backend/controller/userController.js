const userModel = require('../db/userModel')
const { error, success } = require('../utils/handler')

const loginController = async (req,res)=>{
    try {
        const {email, password} = req.body;
        if(!email || !password) {
           return res.send(error(400,"Email and password Required!!"));
        }
        // Find by email or username
        const user = await userModel.findOne({
            $or: [
                { email: email },
                { username: email }
            ]
        });
        if(!user) {
           return res.send(error(401 , "User Not Found!! Please Sign Up"));
        }
        
        const isMatch = await user.matchPassword(password);
        if(!isMatch) {
            return res.send(error(401, "Invalid Password!!"));
        }
        
        return res.send(success(201 , user));
    } catch (err) {
        return res.send(error(401,err.message));
    }
}

const signupContorller = async (req,res)=>{
    try {
        const {username , email , password, securityQuestion, securityAnswer } = req.body;
        if(!username || !email || !password) {
           return res.send(error(401 , "Enter Every Field!!!"));
        }
        
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if(existingUser) {
            return res.send(error(400, "Email is already registered!"));
        }

        const newUser = await userModel.create({
            username, 
            email,
            password,
            securityQuestion: securityQuestion || "",
            securityAnswer: securityAnswer || ""
        });
        
        return res.send(success(201 , "user is created"));
    } catch (err) {
       return res.send(error(401 , err.message));
    }
}

const updateProfileController = async (req, res) => {
    try {
        const { userId, username, email, profilePic } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.send(error(404, "User not found"));
        }
        if (username) user.username = username;
        if (email) user.email = email;
        if (profilePic !== undefined) user.profilePic = profilePic;
        
        await user.save();
        return res.send(success(200, user));
    } catch (err) {
        return res.send(error(400, err.message));
    }
}

const changePasswordController = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.send(error(404, "User not found"));
        }
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.send(error(400, "Incorrect current password"));
        }
        user.password = newPassword;
        await user.save();
        return res.send(success(200, "Password updated successfully"));
    } catch (err) {
        return res.send(error(400, err.message));
    }
}

const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.send(error(404, "No user registered with this email"));
        }
        return res.send(success(200, {
            securityQuestion: user.securityQuestion || "What is your secret key?"
        }));
    } catch (err) {
        return res.send(error(400, err.message));
    }
}

const resetPasswordController = async (req, res) => {
    try {
        const { email, securityAnswer, newPassword } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.send(error(404, "User not found"));
        }
        if (user.securityAnswer.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
            return res.send(error(400, "Incorrect answer to the security question"));
        }
        user.password = newPassword;
        await user.save();
        return res.send(success(200, "Password reset successfully"));
    } catch (err) {
        return res.send(error(400, err.message));
    }
}

const logoutController = async (req,res) => {
    return res.send(success(200, "Logged out"));
}

module.exports = {
    loginController,
    logoutController,
    signupContorller,
    updateProfileController,
    changePasswordController,
    forgotPasswordController,
    resetPasswordController
}