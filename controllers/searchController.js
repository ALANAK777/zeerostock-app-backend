const Inventory = require('../models/Inventory');

// GET - Advanced search with filters
exports.searchInventory = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    let filter = {};

    // Text search on product name (case-insensitive)
    if (q) {
      filter.product_name = { $regex: q, $options: 'i' };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const results = await Inventory.find(filter)
      .populate('supplier_id', 'name city')
      .sort({ product_name: 1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
