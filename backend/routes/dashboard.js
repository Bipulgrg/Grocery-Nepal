const express = require('express');
const router = express.Router();
const { getMonthlyOrderStats, getRecipeCategoryStats } = require('../controllers/dashboard.controller');

// Get monthly order statistics
router.get('/orders/stats', getMonthlyOrderStats);

// Get recipe category statistics
router.get('/recipes/category-stats', getRecipeCategoryStats);

module.exports = router; 