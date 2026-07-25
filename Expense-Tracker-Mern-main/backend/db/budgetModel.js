const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    usersid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    monthlyLimit: {
        type: Number,
        required: true,
        default: 0
    },
    categoryLimits: {
        type: Map,
        of: Number,
        default: {}
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Enforce unique budget per user, month, and year
budgetSchema.index({ usersid: 1, month: 1, year: 1 }, { unique: true });

const budgetModel = mongoose.model('budgets', budgetSchema);

module.exports = budgetModel;
