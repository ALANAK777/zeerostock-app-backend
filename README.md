# Zerostack Backend - Inventory Management API

A robust Express.js API for managing suppliers and inventory with advanced search capabilities. Built with MongoDB for flexible data storage and Mongoose for schema validation.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Search Logic](#search-logic)
- [Performance Optimizations](#performance-optimizations)
- [Error Handling](#error-handling)

---

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local instance running on `localhost:27017`)
- **npm** or **yarn**

### Install MongoDB Locally

**Windows:**
```bash
# Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
# Run the installer and follow the setup wizard
# MongoDB runs as a service by default
```

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variables

### 2. Configure Environment

The `.env` file is already created with default values:

```
MONGO_URI=mongodb://localhost:27017/zerostock
PORT=5000
NODE_ENV=development
```

**To use a different MongoDB URI:**
Edit `.env` and update `MONGO_URI`:
```
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/zerostock
```

### 3. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Expected output:
```
✓ MongoDB Connected: localhost
✓ Server started successfully!
✓ Running on http://localhost:5000
✓ Health check: http://localhost:5000/health
```

---

## Database Schema

### Suppliers Collection

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  city: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

**Constraints:**
- `name` must be unique and at least 2 characters
- `city` is required

### Inventory Collection

```javascript
{
  _id: ObjectId,
  supplier_id: ObjectId (reference to Suppliers),
  product_name: String (required),
  category: String (default: "Uncategorized"),
  quantity: Number (required, >= 0),
  price: Number (required, > 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Constraints:**
- `quantity` must be a non-negative integer
- `price` must be greater than 0
- `supplier_id` must reference a valid supplier

**Indexes:**
- `supplier_id` - Quick supplier lookups
- `product_name` - Text search optimization
- `category` - Category filtering
- `price` - Price range queries
- `(supplier_id, category)` - Compound filtering

---

## API Endpoints

### Suppliers

#### POST /api/suppliers
Create a new supplier

**Request:**
```json
{
  "name": "ABC Suppliers Ltd",
  "city": "New York"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "ABC Suppliers Ltd",
    "city": "New York",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /api/suppliers
Fetch all suppliers

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "ABC Suppliers Ltd",
      "city": "New York",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET /api/suppliers/:id
Fetch a specific supplier by ID

#### PUT /api/suppliers/:id
Update supplier details

#### DELETE /api/suppliers/:id
Delete a supplier

---

### Inventory

#### POST /api/inventory
Add a new inventory item

**Request:**
```json
{
  "supplier_id": "507f1f77bcf86cd799439011",
  "product_name": "Laptop",
  "category": "Electronics",
  "quantity": 25,
  "price": 899.99
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Inventory item created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "supplier_id": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "ABC Suppliers Ltd",
      "city": "New York"
    },
    "product_name": "Laptop",
    "category": "Electronics",
    "quantity": 25,
    "price": 899.99,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /api/inventory
Fetch all inventory with optional filters

**Query Parameters:**
- `supplier_id` - Filter by supplier
- `category` - Filter by category
- `minPrice` - Filter items with price >= minPrice
- `maxPrice` - Filter items with price <= maxPrice

**Example:**
```
GET /api/inventory?category=Electronics&minPrice=500&maxPrice=1500
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

#### GET /api/inventory/grouped-by-supplier
Get inventory grouped by supplier with total inventory value

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "supplier": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "ABC Suppliers Ltd",
        "city": "New York"
      },
      "items": [...],
      "total_items": 15,
      "total_value": 45000
    }
  ]
}
```

**sorted by `total_value` (descending)**

#### GET /api/inventory/:id
Fetch a specific inventory item by ID

#### PUT /api/inventory/:id
Update inventory item details

#### DELETE /api/inventory/:id
Delete an inventory item

---

### Search

#### GET /api/search
Advanced search with multiple filter combinations

**Query Parameters:**
- `q` - Product name (partial match, case-insensitive)
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price

**Example Queries:**
```
GET /api/search?q=laptop
GET /api/search?q=mouse&category=Electronics
GET /api/search?minPrice=100&maxPrice=500
GET /api/search?q=monitor&category=Electronics&minPrice=200&maxPrice=600
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "supplier_id": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "ABC Suppliers Ltd",
        "city": "New York"
      },
      "product_name": "Laptop Pro",
      "category": "Electronics",
      "quantity": 15,
      "price": 1299.99
    }
  ]
}
```

---

## Search Logic

### How Search Filters Work

**Text Search (q parameter):**
- Case-insensitive partial matching on `product_name`
- Uses MongoDB regex: `{ $regex: q, $options: 'i' }`
- Example: `q=lap` matches "Laptop", "LaperTop", "laptop"

**Price Range (minPrice, maxPrice):**
- `minPrice` → `price >= minPrice`
- `maxPrice` → `price <= maxPrice`
- Both are optional and can be used independently

**Category Filter:**
- Exact match on category field
- Optional parameter

**Combined Filters (AND Logic):**
All active filters are combined with AND logic:
```
q AND category AND price_range
```

**Example:**
```
GET /api/search?q=keyboard&category=Electronics&minPrice=50&maxPrice=200
```

Returns all items where:
- Product name contains "keyboard" (case-insensitive)
- **AND** category equals "Electronics"
- **AND** price is between $50 and $200

### Performance Improvements for Large Datasets

**1. Database Indexing**
- ✅ Index on `product_name` - Accelerates text searches
- ✅ Index on `category` - Quick category filtering
- ✅ Index on `price` - Fast range queries
- ✅ Compound index on `(supplier_id, category)` - Combined filtering

**2. Query Optimization**
```javascript
// Use .lean() for read-only search queries
// Reduces memory and increases speed by 30-40%
Inventory.find(filter).lean().populate('supplier_id')

// Pagination for large result sets
Inventory.find(filter).limit(50).skip(offset)
```

**3. Caching Strategy**
- Cache category list (rarely changes)
- Cache frequently searched terms (Redis)
- Cache grouped-by-supplier results (TTL: 5 minutes)

**4. Example Performance Metric**
- With 10,000 inventory items and proper indexing:
  - Simple search: ~10-50ms
  - Filtered search: ~30-100ms
  - Grouped aggregation: ~50-150ms

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request returns data |
| 201 | Created | POST creates new resource |
| 400 | Bad Request | Invalid field values or format |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

### Sample Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    "Price must be greater than 0",
    "Quantity must be a non-negative integer"
  ]
}
```

**Missing Required Field (400):**
```json
{
  "success": false,
  "message": "supplier_id, product_name, quantity, and price are required"
}
```

**Invalid ID Format (400):**
```json
{
  "success": false,
  "message": "Invalid ID format"
}
```

**Resource Not Found (404):**
```json
{
  "success": false,
  "message": "Supplier not found"
}
```

**Duplicate Entry (400):**
```json
{
  "success": false,
  "message": "A supplier with this name already exists"
}
```

---

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Create supplier
curl -X POST http://localhost:5000/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{"name":"TechSupply Co","city":"San Francisco"}'

# Search inventory
curl "http://localhost:5000/api/search?q=laptop&category=Electronics&minPrice=500"

# Get inventory grouped by supplier
curl http://localhost:5000/api/inventory/grouped-by-supplier
```

### Using Postman

1. Import the API endpoints into Postman
2. Set the base URL to `http://localhost:5000`
3. Use the provided request templates

---

## Troubleshooting

**MongoDB Connection Error:**
```
✗ Error connecting to MongoDB: connect ECONNREFUSED
```
- Ensure MongoDB is running: `mongod` (Windows/macOS) or `sudo systemctl start mongodb` (Linux)

**Port 5000 Already In Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
- Change PORT in `.env` file to another port (e.g., 5001)

**Duplicate Key Error:**
```
A supplier with this name already exists
```
- Supplier names must be unique. Use a different name.

---

## Architecture Overview

```
Client (Frontend)
    ↓
Express Server (server.js)
    ├── CORS Middleware
    ├── JSON Parser
    ├── Routes
    │   ├── /api/suppliers
    │   ├── /api/inventory
    │   └── /api/search
    └── Error Handler
        ↓
    Controllers (Business Logic)
    ├── supplierController
    ├── inventoryController
    └── searchController
        ↓
    Middleware (Validation)
    ├── validateSupplierData
    ├── validateInventoryData
    └── validateSearchParams
        ↓
    Mongoose Models
    ├── Supplier Schema
    └── Inventory Schema
        ↓
    MongoDB Database
```

---

## License

ISC

---

## Support

For issues or questions, please refer to the documentation or contact the development team.
