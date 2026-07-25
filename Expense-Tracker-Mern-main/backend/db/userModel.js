const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required  : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
    },
    profilePic: {
        type: String,
        default: ""
    },
    securityQuestion: {
        type: String,
        default: ""
    },
    securityAnswer: {
        type: String,
        default: ""
    },
    expense_id:[{
        type :  mongoose.Schema.Types.ObjectId,
        ref : 'expenses'
    }],
},{
    timestamps : true,
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    // For backwards compatibility or new bcrypt comparison:
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        return await bcrypt.compare(enteredPassword, this.password);
    }
    return enteredPassword === this.password;
};

const userModel = mongoose.model('users' , userSchema);

module.exports = userModel;