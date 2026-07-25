const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    usersid : {
        type :  mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'users'
    },
    title : {
        type : String,
        required : true,
        trim: true
    },
    amount : {
        type : Number,
        required : true 
    },
    category : {
        type : String,
        required : true,
    },
    date : {
        type: String,
        required : true,
    },
    paymentMethod: {
        type: String,
        required: true,
        default: "Cash"
    },
    type: {
        type: String,
        required: true,
        enum: ['Income', 'Expense'],
        default: 'Expense'
    },
    description: {
        type: String,
        default: ""
    }
},{
    timestamps : true
})

const expenseModel = mongoose.model('expenses' , expenseSchema);

module.exports = expenseModel;