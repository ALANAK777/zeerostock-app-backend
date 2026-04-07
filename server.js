const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/mongodb');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const supplierRoutes = require('./routes/suppliers');
const inventoryRoutes = require('./routes/inventory');
const searchRoutes = require('./routes/search');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running ✓' });
});

// API Routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.path}`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✓ Server started successfully!`);
  console.log(`✓ Running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log('\nAvailable endpoints:');
  console.log('  POST   /api/suppliers');
  console.log('  GET    /api/suppliers');
  console.log('  GET    /api/suppliers/:id');
  console.log('  PUT    /api/suppliers/:id');
  console.log('  DELETE /api/suppliers/:id');
  console.log('  POST   /api/inventory');
  console.log('  GET    /api/inventory');
  console.log('  GET    /api/inventory/grouped-by-supplier');
  console.log('  GET    /api/inventory/:id');
  console.log('  PUT    /api/inventory/:id');
  console.log('  DELETE /api/inventory/:id');
  console.log('  GET    /api/search');
  console.log('\n');
});
