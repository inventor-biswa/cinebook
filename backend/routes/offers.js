const express = require('express');
const router = express.Router();
const offersCtrl = require('../controllers/offers.controller');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Public
router.get('/active', offersCtrl.getActiveOffers);
router.post('/validate', offersCtrl.validateOffer);

// Admin only
router.get('/', auth, isAdmin, offersCtrl.getAllOffers);
router.post('/', auth, isAdmin, offersCtrl.createOffer);
router.patch('/:id/toggle', auth, isAdmin, offersCtrl.toggleOffer);

module.exports = router;
