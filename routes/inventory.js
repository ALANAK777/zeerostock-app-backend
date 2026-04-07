const express = require('express');
const {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getGroupedBySupplier,
} = require('../controllers/inventoryController');
const { validateInventoryData, validateSearchParams } = require('../middleware/validation');

const router = express.Router();

// POST /api/inventory - Create inventory item
router.post('/', validateInventoryData, createInventory);

// GET /api/inventory/grouped-by-supplier - Get inventory grouped by supplier
router.get('/grouped-by-supplier', getGroupedBySupplier);

// GET /api/inventory - Get all inventory (with optional filters)
router.get('/', validateSearchParams, getAllInventory);

// GET /api/inventory/:id - Get inventory by ID
router.get('/:id', getInventoryById);

// PUT /api/inventory/:id - Update inventory
router.put('/:id', updateInventory);

// DELETE /api/inventory/:id - Delete inventory
router.delete('/:id', deleteInventory);

module.exports = router;
