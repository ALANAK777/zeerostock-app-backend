const mongoose = require('mongoose');
require('dotenv').config();
const Supplier = require('./models/Supplier');
const Inventory = require('./models/Inventory');

// Conversion rate: 1 USD = 83 INR
const USD_TO_INR = 83;

// Sample Data
const sampleSuppliers = [
  {
    name: 'TechSupply Co',
    city: 'San Francisco',
  },
  {
    name: 'Global Electronics Ltd',
    city: 'Singapore',
  },
  {
    name: 'Industrial Components Inc',
    city: 'Mumbai',
  },
  {
    name: 'Premium Tech Solutions',
    city: 'Tokyo',
  },
  {
    name: 'Budget Hardware Store',
    city: 'Mexico City',
  },
];

const sampleInventory = [
  // TechSupply Co inventory
  {
    product_name: 'Laptop Pro 15"',
    category: 'Electronics',
    quantity: 45,
    price: 107899.17, // 1299.99 USD * 83
    supplier: 0, // Reference to TechSupply Co
  },
  {
    product_name: 'USB-C Hub',
    category: 'Accessories',
    quantity: 150,
    price: 4149.17, // 49.99 USD * 83
    supplier: 0,
  },
  {
    product_name: 'Wireless Mouse',
    category: 'Accessories',
    quantity: 200,
    price: 2489.17, // 29.99 USD * 83
    supplier: 0,
  },
  {
    product_name: '4K Monitor',
    category: 'Electronics',
    quantity: 30,
    price: 49799.17, // 599.99 USD * 83
    supplier: 0,
  },

  // Global Electronics Ltd inventory
  {
    product_name: 'Smartphone X',
    category: 'Electronics',
    quantity: 120,
    price: 74699.17, // 899.99 USD * 83
    supplier: 1,
  },
  {
    product_name: 'Wireless Earbuds',
    category: 'Audio',
    quantity: 200,
    price: 16599.17, // 199.99 USD * 83
    supplier: 1,
  },
  {
    product_name: 'Phone Case',
    category: 'Accessories',
    quantity: 500,
    price: 1659.17, // 19.99 USD * 83
    supplier: 1,
  },
  {
    product_name: 'Charger (Fast)',
    category: 'Accessories',
    quantity: 300,
    price: 3319.17, // 39.99 USD * 83
    supplier: 1,
  },

  // Industrial Components Inc inventory
  {
    product_name: 'Resistor Pack (100)',
    category: 'Components',
    quantity: 1000,
    price: 1327.17, // 15.99 USD * 83
    supplier: 2,
  },
  {
    product_name: 'Capacitor Set',
    category: 'Components',
    quantity: 500,
    price: 2157.17, // 25.99 USD * 83
    supplier: 2,
  },
  {
    product_name: 'Arduino Microcontroller',
    category: 'Microcontrollers',
    quantity: 75,
    price: 2904.17, // 34.99 USD * 83
    supplier: 2,
  },
  {
    product_name: 'LED Strip (RGB)',
    category: 'Lighting',
    quantity: 85,
    price: 2074.17, // 24.99 USD * 83
    supplier: 2,
  },

  // Premium Tech Solutions inventory
  {
    product_name: 'Tablet Pro Max',
    category: 'Electronics',
    quantity: 35,
    price: 91299.17, // 1099.99 USD * 83
    supplier: 3,
  },
  {
    product_name: 'Keyboard Mechanical',
    category: 'Accessories',
    quantity: 90,
    price: 14939.17, // 179.99 USD * 83
    supplier: 3,
  },
  {
    product_name: 'Webcam 4K',
    category: 'Electronics',
    quantity: 50,
    price: 20749.17, // 249.99 USD * 83
    supplier: 3,
  },
  {
    product_name: 'Desk Lamp LED',
    category: 'Lighting',
    quantity: 120,
    price: 6639.17, // 79.99 USD * 83
    supplier: 3,
  },

  // Budget Hardware Store inventory
  {
    product_name: 'Budget Keyboard',
    category: 'Accessories',
    quantity: 250,
    price: 1659.17, // 19.99 USD * 83
    supplier: 4,
  },
  {
    product_name: 'Standard Mouse',
    category: 'Accessories',
    quantity: 300,
    price: 829.17, // 9.99 USD * 83
    supplier: 4,
  },
  {
    product_name: 'HDMI Cable (2m)',
    category: 'Cables',
    quantity: 400,
    price: 580.17, // 6.99 USD * 83
    supplier: 4,
  },
  {
    product_name: 'USB Cable Pack',
    category: 'Cables',
    quantity: 350,
    price: 1078.17, // 12.99 USD * 83
    supplier: 4,
  },
];

// Seed Database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // Check if data already exists
    const supplierCount = await Supplier.countDocuments();
    if (supplierCount > 0) {
      console.log('⚠ Database already contains data. Clearing existing data...');
      await Supplier.deleteMany({});
      await Inventory.deleteMany({});
      console.log('✓ Cleared existing data');
    }

    // Insert suppliers
    console.log('\n📦 Inserting sample suppliers...');
    const createdSuppliers = await Supplier.insertMany(sampleSuppliers);
    console.log(`✓ Created ${createdSuppliers.length} suppliers`);

    createdSuppliers.forEach((supplier) => {
      console.log(`   - ${supplier.name} (${supplier.city})`);
    });

    // Create inventory data with actual supplier IDs
    console.log('\n📦 Inserting sample inventory...');
    const inventoryWithSupplierIds = sampleInventory.map((item) => ({
      supplier_id: createdSuppliers[item.supplier]._id,
      product_name: item.product_name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
    }));

    const createdInventory = await Inventory.insertMany(
      inventoryWithSupplierIds
    );
    console.log(`✓ Created ${createdInventory.length} inventory items`);

    // Display summary statistics
    console.log('\n📊 Data Summary:');
    const grouped = await Inventory.aggregate([
      {
        $group: {
          _id: '$supplier_id',
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
    ]);

    console.log('\nSupplier Inventory Value:');
    grouped.forEach((group) => {
      console.log(
        `   ${group.supplier.name}: ${group.total_items} items, Total Value: ₹${group.total_value.toFixed(
          2
        )}`
      );
    });

    const totalValue = grouped.reduce((sum, g) => sum + g.total_value, 0);
    console.log(`\nTotal Inventory Value: ₹${totalValue.toFixed(2)}`);

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
