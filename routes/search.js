const express = require('express');
const { searchInventory } = require('../controllers/searchController');
const { validateSearchParams } = require('../middleware/validation');

const router = express.Router();

// GET /api/search - Search inventory with filters
router.get('/', validateSearchParams, searchInventory);

module.exports = router;
