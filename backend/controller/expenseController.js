const expenseModel = require('../db/expenseModel');
const userModel = require('../db/userModel');
const sendEmailWithAttachment = require('../utils/emailSend');
const { error, success } = require('../utils/handler');

const createExpense = async (req,res)=>{
    try {
        console.log("Incoming transaction payload:", req.body);
        const {amount , category , date , title, paymentMethod, description, type} = req.body;
        const usersid = req.userId; // Securely retrieved from auth middleware
        if(!amount || !category || !date || !title)
        {
            return res.send(error(400,"All Details Are Required"));
        }
        const newExpense = await expenseModel.create({
            amount,
            category,
            date,
            usersid,
            title,
            paymentMethod,
            description,
            type: type || 'Expense'
        });
        const userToUse = await userModel.findById(usersid);
        if(!userToUse) {
            return res.send(error(404, "User not found"));
        }
        userToUse.expense_id.push(newExpense._id);
        await userToUse.save();
        return res.send(success(200,newExpense))
        
    } catch (e) {
        return res.send(error(500,e.message))
    }
}

const deleteExpense = async (req,res)=>{
    try {
        const {expenseId} = req.body;
        const userId = req.userId; // Securely retrieved from auth middleware
        const expense = await expenseModel.findById(expenseId)
        const user = await userModel.findById(userId);
        if(!expense || !user)
        {
            return res.send(error(400,`Invalid expense or user`))
        }

        // Ownership Check: Ensure this expense belongs to the authenticated user
        if (expense.usersid.toString() !== userId.toString()) {
            return res.send(error(403, "Forbidden: You do not own this expense"));
        }
        
        await expenseModel.findByIdAndDelete(expenseId);
        const index = user.expense_id.indexOf(expenseId);
        if (index > -1) {
            user.expense_id.splice(index, 1);
        }
        await user.save();
        return res.send(success(201,{respo : 'Successfully Deleted' , user}));
    } catch (e) {
       return res.send(error(500,e.message))
    }
}

const getAllExpenses = async (req,res)=>{
    try {
        const {search, category, startDate, endDate, sortBy, order, page, limit} = req.body;
        const userId = req.userId; // Securely retrieved from auth middleware
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
        return res.send(error(500,e.message))   
    }
}

const getCategoryExpense = async (req,res)=>{
    try {
        const userId = req.userId; // Securely retrieved from auth middleware
        const expenses = await expenseModel.find({ usersid: userId });
        
        // Aggregate by category
        const categoryData = {};
        expenses.forEach(exp => {
            categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.amount;
        });
        
        return res.send(success(200, categoryData));
    } catch (e) {
        return res.send(error(500,e.message))
    }
}

const emailSender = (req,res)=>{
    try {
        const {recipient , body} = req.body;
        sendEmailWithAttachment(recipient,body);
        return res.send(success(201,"Email Sent"))
    } catch (error) {
        return res.send(error(500,"Email Is Wrong"))
    }
}

module.exports = {
    createExpense ,
    deleteExpense , 
    getCategoryExpense ,
    getAllExpenses,
    emailSender
}