const express = require('express');
const { getBudget, updateBudget } = require('../controller/budgetController');
const router = express.Router();

router.post('/getBudget', getBudget);
router.post('/updateBudget', updateBudget);

module.exports = router;
