const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');
const { getStats, getRevenueByItem, getRecentBookings } = require('../../controllers/admin/reports.controller');

// ALL routes protected by Admin middleware
router.use(auth, isAdmin);

// GET /api/admin/reports/stats
router.get('/stats', getStats);

// GET /api/admin/reports/revenue-by-item
router.get('/revenue-by-item', getRevenueByItem);

// GET /api/admin/reports/recent
router.get('/recent', getRecentBookings);

module.exports = router;
