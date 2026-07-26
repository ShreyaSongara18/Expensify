const { createExpense, deleteExpense, getCategoryExpense, getAllExpenses, emailSender } = require('../controller/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = require('express').Router();

router.post('/addExpense', authMiddleware, createExpense)
router.post('/deleteExpense', authMiddleware, deleteExpense)
router.get('/categoryExpense', authMiddleware, getCategoryExpense)
router.post('/allExpenses', authMiddleware, getAllExpenses)
router.post('/sendEmail', authMiddleware, emailSender);

module.exports = router;