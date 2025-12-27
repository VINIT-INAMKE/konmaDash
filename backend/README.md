# QSR Inventory & Sales Management - Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/konmaxperience
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/konmaxperience

PORT=5000
NODE_ENV=development
```

4. Start the server:
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## API Endpoints

### Admin Routes (`/api/admin`)
- Raw Ingredients
  - `POST /raw-ingredients` - Create
  - `GET /raw-ingredients` - List all
  - `PUT /raw-ingredients/:id` - Update
  - `DELETE /raw-ingredients/:id` - Delete

- Semi-Processed Items
  - `POST /semi-processed-items` - Create
  - `GET /semi-processed-items` - List all
  - `PUT /semi-processed-items/:id` - Update

- Semi-Processed Recipes
  - `POST /semi-processed-recipes` - Create
  - `GET /semi-processed-recipes` - List all
  - `GET /semi-processed-recipes/:id` - Get one
  - `PUT /semi-processed-recipes/:id` - Update
  - `DELETE /semi-processed-recipes/:id` - Delete

- SKU Items
  - `POST /sku-items` - Create
  - `GET /sku-items` - List all
  - `GET /sku-items/:id` - Get one
  - `PUT /sku-items/:id` - Update
  - `DELETE /sku-items/:id` - Delete

- SKU Recipes
  - `POST /sku-recipes` - Create
  - `GET /sku-recipes` - List all
  - `GET /sku-recipes/by-sku/:skuId` - Get by SKU
  - `PUT /sku-recipes/by-sku/:skuId` - Update
  - `DELETE /sku-recipes/by-sku/:skuId` - Delete

### Kitchen Routes (`/api/kitchen`)
- `POST /batch-cook` - Cook a batch (deducts raw ingredients, adds to semi-processed)
- `GET /batch-logs` - Get batch cooking history
- `GET /semi-processed` - View semi-processed inventory
- `POST /transfer` - **Send SKUs to counter (SINGLE ACTION: deducts semi-processed + updates counter stock instantly)**
- `GET /transfers` - View transfer history (audit trail)
- `GET /check-availability?skuId=X&quantity=Y` - Check if enough semi-processed available

### Stall/Counter Routes (`/api/stall`)
- ~~`GET /pending-transfers`~~ - **DEPRECATED** (returns empty - no pending transfers)
- `GET /transfer-history` - View completed transfers (audit trail only)
- ~~`POST /receive-transfer/:id`~~ - **DEPRECATED** (counter stock updates automatically)
- `GET /inventory` - View current counter SKU stock
- `POST /sale` - Record a sale (deducts from counter stock)
- `GET /sales` - View sales history
- `GET /sales-summary` - Get sales summary by SKU

### Alert Routes (`/api/alerts`)
- `GET /` - Get all alerts (low stock + low raw)
- `GET /low-stock` - Get SKUs below threshold at stall
- `GET /low-raw` - Get raw ingredients below reorder level

## Health Check
- `GET /health` - Server health status
