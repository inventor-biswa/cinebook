const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');
const { getAllEvents, createEvent, updateEvent, deleteEvent } = require('../../controllers/admin/events.controller');

// ALL routes here are protected by BOTH auth and isAdmin middleware
router.use(auth, isAdmin);

// GET /api/admin/events
router.get('/', getAllEvents);

// POST /api/admin/events
router.post('/', createEvent);

// PUT /api/admin/events/:id
router.put('/:id', updateEvent);

// DELETE /api/admin/events/:id
router.delete('/:id', deleteEvent);

module.exports = router;
