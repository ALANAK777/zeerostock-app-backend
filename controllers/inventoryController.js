const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');

// POST - Add inventory item
exports.createInventory = async (req, res, next) => {
  try {
    const { supplier_id, product_name, quantity, price, category } = req.body;

    // Check if supplier exists
    const supplier = await Supplier.findById(supplier_id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    const inventory = await Inventory.create({
      supplier_id,
      product_name: product_name.trim(),
      quantity,
      price,
      category: category ? category.trim() : 'Uncategorized',
    });

    // Populate supplier details
    await inventory.populate('supplier_id', 'name city');

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

// GET - Fetch all inventory with optional filters
exports.getAllInventory = async (req, res, next) => {
  try {
    const { supplier_id, category, minPrice, maxPrice } = req.query;
    let filter = {};

    // Build filter object
    if (supplier_id) {
      filter.supplier_id = supplier_id;
    }
    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const inventory = await Inventory.find(filter)
      .populate('supplier_id', 'name city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

// GET - Fetch single inventory item by ID
exports.getInventoryById = async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate(
      'supplier_id',
      'name city'
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

// PUT - Update inventory item
exports.updateInventory = async (req, res, next) => {
  try {
    const { product_name, quantity, price, category, supplier_id } = req.body;
    const updateData = {};

    if (product_name) updateData.product_name = product_name.trim();
    if (quantity !== undefined) updateData.quantity = quantity;
    if (price) updateData.price = price;
    if (category) updateData.category = category.trim();
    if (supplier_id) {
      // Validate supplier exists
      const supplier = await Supplier.findById(supplier_id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found',
        });
      }
      updateData.supplier_id = supplier_id;
    }

    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('supplier_id', 'name city');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE - Delete inventory item
exports.deleteInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

// GET - Inventory grouped by supplier with total value
exports.getGroupedBySupplier = async (req, res, next) => {
  try {
    const grouped = await Inventory.aggregate([
      {
        $group: {
          _id: '$supplier_id',
          items: { $push: '$$ROOT' },
          total_items: { $sum: 1 },
          total_value: {
            $sum: { $multiply: ['$quantity', '$price'] },
          },
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      {
        $unwind: '$supplier',
      },
      {
        $sort: { total_value: -1 },
      },
      {
        $project: {
          _id: 0,
          supplier: {
            _id: '$supplier._id',
            name: '$supplier.name',
            city: '$supplier.city',
          },
          items: 1,
          total_items: 1,
          total_value: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: grouped.length,
      data: grouped,
    });
  } catch (error) {
    next(error);
  }
};
