const mongoose = require('mongoose');

// Validate Supplier creation data
const validateSupplierData = (req, res, next) => {
  const { name, city } = req.body;

  if (!name || !city) {
    return res.status(400).json({
      success: false,
      message: 'Name and city are required',
    });
  }

  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Supplier name must be at least 2 characters',
    });
  }

  if (typeof city !== 'string' || city.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'City must be at least 2 characters',
    });
  }

  next();
};

// Validate Inventory creation data
const validateInventoryData = (req, res, next) => {
  const { supplier_id, product_name, quantity, price, category } = req.body;

  // Check required fields
  if (!supplier_id || !product_name || quantity === undefined || !price) {
    return res.status(400).json({
      success: false,
      message: 'supplier_id, product_name, quantity, and price are required',
    });
  }

  // Validate supplier_id is valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(supplier_id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid supplier_id format',
    });
  }

  // Validate quantity
  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a non-negative integer',
    });
  }

  // Validate price
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number',
    });
  }

  // Validate product_name
  if (typeof product_name !== 'string' || product_name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Product name must be at least 2 characters',
    });
  }

  next();
};

// Validate query parameters for search
const validateSearchParams = (req, res, next) => {
  const { minPrice, maxPrice } = req.query;

  if (minPrice !== undefined) {
    const min = parseFloat(minPrice);
    if (isNaN(min) || min < 0) {
      return res.status(400).json({
        success: false,
        message: 'minPrice must be a positive number',
      });
    }
  }

  if (maxPrice !== undefined) {
    const max = parseFloat(maxPrice);
    if (isNaN(max) || max < 0) {
      return res.status(400).json({
        success: false,
        message: 'maxPrice must be a positive number',
      });
    }
  }

  if (minPrice && maxPrice) {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (min > max) {
      return res.status(400).json({
        success: false,
        message: 'minPrice cannot be greater than maxPrice',
      });
    }
  }

  next();
};

module.exports = {
  validateSupplierData,
  validateInventoryData,
  validateSearchParams,
};
