const budgetModel = require('../db/budgetModel');
const { error, success } = require('../utils/handler');

const getBudget = async (req, res) => {
    try {
        const { month, year } = req.body;
        const userId = req.userId; // Securely retrieved from auth middleware
        if (!month || !year) {
            return res.send(error(400, "Month and year are required"));
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
        return res.send(error(500, e.message));
    }
};

const updateBudget = async (req, res) => {
    try {
        const { month, year, monthlyLimit, categoryLimits } = req.body;
        const userId = req.userId; // Securely retrieved from auth middleware
        if (!month || !year) {
            return res.send(error(400, "Month and year are required"));
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
        return res.send(error(500, e.message));
    }
};

module.exports = {
    getBudget,
    updateBudget
};
