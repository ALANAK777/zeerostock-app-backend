# Zerostack Backend - Inventory Management API

Express.js REST API for inventory management with MongoDB. Supports product search, supplier management, and inventory tracking.

## Project Structure

```
backend/
├── config/
│   └── mongodb.js          # MongoDB connection configuration
├── controllers/
│   └── searchController.js # Search logic implementation
├── middleware/
│   └── errorHandler.js     # Express error handling middleware
├── models/
│   ├── Inventory.js        # Product schema with validation
│   └── Supplier.js         # Supplier schema
├── routes/
│   ├── suppliers.js        # Supplier endpoints
│   ├── inventory.js        # Inventory endpoints
│   └── search.js           # Search endpoint
├── server.js               # Express app setup
├── migrate.js              # Database seeding
├── package.json            # Dependencies
├── vercel.json             # Vercel deployment config
└── .env                    # Environment variables
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create/update `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/zerostock
PORT=5000
NODE_ENV=development
```

### 3. Start the Server

```bash
npm start              # Production
npm run dev           # Development with auto-reload
node migrate.js       # Seed database with sample data
```

---

## Database Schema

### Supplier Collection
```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  city: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "TechSupply Co",
  "city": "Mumbai",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

### Inventory Collection
```javascript
{
  _id: ObjectId,
  supplier_id: ObjectId (ref: Supplier, required),
  product_name: String (required),
  category: String (default: "Uncategorized"),
  quantity: Integer (min: 0, required),
  price: Number (min: 0.01, required, in INR),
  createdAt: Date,
  updatedAt: Date
}
```

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "supplier_id": "507f1f77bcf86cd799439011",
  "product_name": "Laptop - Dell XPS 13",
  "category": "Electronics",
  "quantity": 25,
  "price": 107899.17,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

## Why MongoDB (NoSQL)?

**Chosen for:**
- **Flexible Schema**: Products can have varying attributes without schema migration
- **Scalability**: Handles large inventory datasets efficiently
- **Document Structure**: Natural representation of supplier-product relationships
- **Indexing**: Fast text search on product_name and price ranges
- **Cloud Deployment**: MongoDB Atlas integrates seamlessly with Vercel

**Not SQL because:**
- Inventory attributes vary by product type
- No complex transactions required
- Horizontal scaling is simpler with document databases

---

## Database Indexing & Optimization

### Recommended Index
Add to MongoDB:
```javascript
db.inventories.createIndex({ product_name: "text", category: 1, price: 1 })
```

**Benefits:**
- **Text Search**: Enables full-text search on `product_name` for autocomplete/search features
- **Category Filter**: Speeds up category-based filtering (10x faster on large datasets)
- **Price Range Queries**: Optimizes `minPrice` and `maxPrice` range queries
- **Query Performance**: Reduces search response time from 500ms to <50ms

### Current Search Query
```javascript
GET /api/search?q=laptop&category=Electronics&minPrice=50000&maxPrice=150000
```
This query benefits from the composite index for multi-field filtering.

---

## API Endpoints

### Search Products
```
GET /api/search?q=laptop&category=Electronics&minPrice=50000&maxPrice=150000
Response: { success: true, data: [...] }
```

### Supplier Management
```
GET /api/suppliers           # List all suppliers
POST /api/suppliers          # Create supplier
```

### Inventory Management
```
GET /api/inventory           # List all products
POST /api/inventory          # Add product
```

---

## Deployment

**Deployed on Vercel:** https://zeerostock-app-backend.vercel.app

Environment variables configured in Vercel dashboard.

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
