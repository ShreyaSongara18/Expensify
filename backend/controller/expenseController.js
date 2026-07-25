const expenseModel = require('../db/expenseModel');
const userModel = require('../db/userModel');
const sendEmailWithAttachment = require('../utils/emailSend');
const { error, success } = require('../utils/handler');

const createExpense = async (req,res)=>{
    try {
        console.log("Incoming transaction payload:", req.body);
        const {amount , category , date , usersid, title, paymentMethod, description} = req.body;
        if(!amount || !category || !date || !usersid || !title)
        {
            return res.send(error(401,"All Details Are Required"));
        }
        const newExpense = await expenseModel.create(req.body);
        const userToUse = await userModel.findById(usersid);
        if(!userToUse) {
            return res.send(error(404, "User not found"));
        }
        userToUse.expense_id.push(newExpense._id);
        await userToUse.save();
        return res.send(success(200,newExpense))
        
    } catch (e) {
        return res.send(error(401,e.message))
    }
}

const deleteExpense = async (req,res)=>{
    try {
        const {expenseId , userId} = req.body;
        const expense = await expenseModel.findById(expenseId)
        const user = await userModel.findById(userId);
        if(!expense || !user)
        {
            return res.send(error(401,`Invalid expense or user`))
        }
        
        await expenseModel.findByIdAndDelete(expenseId);
        const index = user.expense_id.indexOf(expenseId);
        if (index > -1) {
            user.expense_id.splice(index, 1);
        }
        await user.save();
        return res.send(success(201,{respo : 'Successfully Deleted' , user}));
    } catch (e) {
       return res.send(error(401,e.message))
    }
}

const getAllExpenses = async (req,res)=>{
    try {
        const {userId, search, category, startDate, endDate, sortBy, order, page, limit} = req.body;
        if (!userId) {
            return res.send(error(400, "User ID is required"));
        }
        
        // Build search & filter queries
        let query = { usersid: userId };
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (category && category !== 'All') {
            query.category = category;
        }
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = startDate;
            }
            if (endDate) {
                query.date.$lte = endDate;
            }
        }
        
        // Sort behavior
        let sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = order === 'asc' ? 1 : -1;
        } else {
            sortOptions['date'] = -1; // default: newest first
        }
        
        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        
        const total = await expenseModel.countDocuments(query);
        const expenses = await expenseModel.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);
            
        return res.send(success(200, {
            expenses,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }));
    } catch (e) {
        return res.send(error(401,e.message))   
    }
}

const getCategoryExpense = async (req,res)=>{
    try {
        const { userId } = req.body;
        const expenses = await expenseModel.find({ usersid: userId });
        
        // Aggregate by category
        const categoryData = {};
        expenses.forEach(exp => {
            categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.amount;
        });
        
        return res.send(success(200, categoryData));
    } catch (e) {
        return res.send(error(401,e.message))
    }
}

const emailSender = (req,res)=>{
    try {
        const {recipient , body} = req.body;
        sendEmailWithAttachment(recipient,body);
        return res.send(success(201,"Email Sent"))
    } catch (error) {
        return res.send(error(401,"Email Is Wrong"))
    }
}

module.exports = {
    createExpense ,
    deleteExpense , 
    getCategoryExpense ,
    getAllExpenses,
    emailSender
}