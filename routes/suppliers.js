const express = require('express');
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { validateSupplierData } = require('../middleware/validation');

const router = express.Router();

// POST /api/suppliers - Create supplier
router.post('/', validateSupplierData, createSupplier);

// GET /api/suppliers - Get all suppliers
router.get('/', getAllSuppliers);

// GET /api/suppliers/:id - Get supplier by ID
router.get('/:id', getSupplierById);

// PUT /api/suppliers/:id - Update supplier
router.put('/:id', validateSupplierData, updateSupplier);

// DELETE /api/suppliers/:id - Delete supplier
router.delete('/:id', deleteSupplier);

module.exports = router;
