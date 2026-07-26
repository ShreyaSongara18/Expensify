const express = require('express');
const { getBudget, updateBudget } = require('../controller/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/getBudget', authMiddleware, getBudget);
router.post('/updateBudget', authMiddleware, updateBudget);

module.exports = router;
