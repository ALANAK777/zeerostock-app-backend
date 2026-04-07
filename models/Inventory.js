const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier ID is required'],
    },
    product_name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'Uncategorized',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than 0'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
inventorySchema.index({ supplier_id: 1 });
inventorySchema.index({ product_name: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ price: 1 });
inventorySchema.index({ supplier_id: 1, category: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
