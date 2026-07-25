const budgetModel = require('../db/budgetModel');
const { error, success } = require('../utils/handler');

const getBudget = async (req, res) => {
    try {
        const { userId, month, year } = req.body;
        if (!userId || !month || !year) {
            return res.send(error(400, "User ID, month, and year are required"));
        }
        
        let budget = await budgetModel.findOne({ usersid: userId, month, year });
        if (!budget) {
            // Create a default budget settings object if none exists yet
            budget = await budgetModel.create({
                usersid: userId,
                month,
                year,
                monthlyLimit: 0,
                categoryLimits: {}
            });
        }
        
        return res.send(success(200, budget));
    } catch (e) {
        return res.send(error(400, e.message));
    }
};

const updateBudget = async (req, res) => {
    try {
        const { userId, month, year, monthlyLimit, categoryLimits } = req.body;
        if (!userId || !month || !year) {
            return res.send(error(400, "User ID, month, and year are required"));
        }
        
        let budget = await budgetModel.findOne({ usersid: userId, month, year });
        if (!budget) {
            budget = new budgetModel({
                usersid: userId,
                month,
                year
            });
        }
        
        if (monthlyLimit !== undefined) {
            budget.monthlyLimit = monthlyLimit;
        }
        if (categoryLimits !== undefined) {
            budget.categoryLimits = categoryLimits;
        }
        
        await budget.save();
        return res.send(success(200, budget));
    } catch (e) {
        return res.send(error(400, e.message));
    }
};

module.exports = {
    getBudget,
    updateBudget
};
