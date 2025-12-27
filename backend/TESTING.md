# Backend Testing Guide - FINAL CORRECT FLOW

## Prerequisites
1. Start MongoDB (local or Atlas)
2. Start the backend server: `npm run dev`
3. Import `postman_collection.json` into Postman (needs updating)

## IMPORTANT: Flow Change

**The system now implements SINGLE ACTION transfer:**
- Kitchen sends → Counter stock updated INSTANTLY
- No "pending" state, no "receive" action needed
- Transfer log is for audit trail only

---

## Testing Flow (Recommended Order)

### Step 0: Health Check
Run the "Health Check" request to ensure server is running.

---

### PART 1: ADMIN SETUP

### Step 1: Create Raw Ingredients
1. **Create Chicken**
   ```json
   POST /api/admin/raw-ingredients
   {
     "name": "Chicken",
     "unit": "kg",
     "currentStock": 10,
     "reorderLevel": 3,
     "canReplenish": true
   }
   ```
   📝 Copy the `_id` from response

2. **Create Butter Masala Base**
   ```json
   {
     "name": "Butter Masala Base",
     "unit": "g",
     "currentStock": 5000,
     "reorderLevel": 1000,
     "canReplenish": true
   }
   ```

3. **Get All Raw Ingredients** - Verify both exist

---

### Step 2: Create Semi-Processed Fixed Items
1. **Create Danish Pastry**
   ```json
   POST /api/admin/semi-processed-items
   {
     "name": "Danish Pastry 45g",
     "type": "fixed",
     "unit": "nos",
     "currentStock": 50
   }
   ```
   📝 Copy the `_id`

2. **Create Grated Cheese**
   ```json
   {
     "name": "Grated Cheese",
     "type": "fixed",
     "unit": "g",
     "currentStock": 2700
   }
   ```
   📝 Copy the `_id`

3. **Get All Semi-Processed Items** - Verify both exist

---

### Step 3: Create Semi-Processed Recipe (Raw → Semi)
1. **Create Butter Chicken Recipe**
   ```json
   POST /api/admin/semi-processed-recipes
   {
     "outputName": "Butter Chicken Gravy",
     "outputQuantity": 1000,
     "outputUnit": "ml",
     "ingredients": [
       {
         "rawIngredientId": "<CHICKEN_ID>",
         "rawIngredientName": "Chicken",
         "quantity": 0.5,
         "unit": "kg"
       },
       {
         "rawIngredientId": "<MASALA_ID>",
         "rawIngredientName": "Butter Masala Base",
         "quantity": 500,
         "unit": "g"
       }
     ],
     "instructions": "Cook chicken tikka, prepare butter masala gravy, combine"
   }
   ```
   📝 Copy the `_id` from response (recipe ID)

2. **Get All Recipes** - Verify recipe was created

---

### Step 4: Create SKU Item
1. **Create Butter Chicken Danish SKU**
   ```json
   POST /api/admin/sku-items
   {
     "name": "Butter Chicken Danish",
     "targetSkus": 15,
     "currentStallStock": 0,
     "lowStockThreshold": 5,
     "price": 150,
     "isActive": true
   }
   ```
   📝 Copy the `_id` (SKU ID)

2. **Get All SKU Items** - Verify SKU exists

---

### Step 5: Create SKU Recipe (Semi → SKU)
1. **Create Butter Chicken Danish Recipe**

   After creating Butter Chicken batch in Step 7, get the semi-processed items list to find the Butter Chicken Gravy ID.

   ```json
   POST /api/admin/sku-recipes
   {
     "skuId": "<SKU_ID>",
     "skuName": "Butter Chicken Danish",
     "ingredients": [
       {
         "semiProcessedId": "<BUTTER_CHICKEN_GRAVY_ID>",
         "semiProcessedName": "Butter Chicken Gravy",
         "quantity": 60,
         "unit": "ml"
       },
       {
         "semiProcessedId": "<DANISH_PASTRY_ID>",
         "semiProcessedName": "Danish Pastry 45g",
         "quantity": 1,
         "unit": "nos"
       },
       {
         "semiProcessedId": "<GRATED_CHEESE_ID>",
         "semiProcessedName": "Grated Cheese",
         "quantity": 20,
         "unit": "g"
       }
     ]
   }
   ```

2. **Get SKU Recipe** - Verify recipe was created

---

### PART 2: KITCHEN OPERATIONS

### Step 6: Verify Initial State
1. **Get Raw Ingredients**
   - Chicken: 10 kg ✅
   - Butter Masala Base: 5000 g ✅

2. **Get Semi-Processed Items**
   - Butter Chicken Gravy: 0 ml (not created yet)
   - Danish Pastry: 50 nos ✅
   - Grated Cheese: 2700 g ✅

3. **Get Counter Inventory**
   - Butter Chicken Danish: 0 ✅

---

### Step 7: Batch Cooking (Raw → Semi-Processed)
1. **Cook Batch - Butter Chicken (2x multiplier = 2000ml)**
   ```json
   POST /api/kitchen/batch-cook
   {
     "recipeId": "<RECIPE_ID>",
     "multiplier": 2,
     "createdBy": "Chef Ram"
   }
   ```

2. **Verify Raw Ingredients Deducted**
   ```
   GET /api/admin/raw-ingredients
   ```
   - Chicken: 9 kg (10 - 1) ✅
   - Butter Masala Base: 4000 g (5000 - 1000) ✅

3. **Verify Semi-Processed Added**
   ```
   GET /api/kitchen/semi-processed
   ```
   - Butter Chicken Gravy: 2000 ml ✅ (NEW!)
   - Danish Pastry: 50 nos ✅
   - Grated Cheese: 2700 g ✅

4. **Get Batch Logs** - Verify batch was logged with batch ID

---

### Step 8: Check Availability Before Sending
1. **Check if can send 15 SKUs**
   ```
   GET /api/kitchen/check-availability?skuId=<SKU_ID>&quantity=15
   ```

   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "allAvailable": true,
       "items": [
         {
           "itemName": "Butter Chicken Gravy",
           "required": 900,
           "available": 2000,
           "unit": "ml",
           "isAvailable": true
         },
         {
           "itemName": "Danish Pastry 45g",
           "required": 15,
           "available": 50,
           "unit": "nos",
           "isAvailable": true
         },
         {
           "itemName": "Grated Cheese",
           "required": 300,
           "available": 2700,
           "unit": "g",
           "isAvailable": true
         }
       ]
     }
   }
   ```

---

### Step 9: Send to Counter (SINGLE ACTION - CRITICAL TEST)
1. **Send 15 SKUs to Counter**
   ```json
   POST /api/kitchen/transfer
   {
     "skuId": "<SKU_ID>",
     "quantity": 15,
     "sentBy": "Kitchen Staff"
   }
   ```

2. **Verify INSTANT Changes:**

   **A. Semi-Processed Deducted Immediately**
   ```
   GET /api/kitchen/semi-processed
   ```
   - Butter Chicken Gravy: **1100 ml** (2000 - 900) ✅
   - Danish Pastry: **35 nos** (50 - 15) ✅
   - Grated Cheese: **2400 g** (2700 - 300) ✅

   **B. Counter Stock Updated Immediately**
   ```
   GET /api/stall/inventory
   ```
   - Butter Chicken Danish: **15** ✅ INSTANT!

   **C. Transfer Log Created**
   ```
   GET /api/kitchen/transfers
   ```
   - Status: "completed" ✅
   - sentAt: <timestamp> ✅
   - receivedAt: <same timestamp> ✅
   - receivedBy: "Auto" ✅

3. **Verify NO Pending Transfers**
   ```
   GET /api/stall/pending-transfers
   ```
   Should return: `{ "success": true, "data": [], "message": "..." }`

---

### PART 3: COUNTER OPERATIONS

### Step 10: Sales
1. **Record Sale - Sell 2 Units**
   ```json
   POST /api/stall/sale
   {
     "skuId": "<SKU_ID>",
     "quantity": 2,
     "soldBy": "Cashier 1"
   }
   ```

2. **Verify Counter Stock Reduced**
   ```
   GET /api/stall/inventory
   ```
   - Butter Chicken Danish: **13** (15 - 2) ✅

3. **Get Sales History**
   ```
   GET /api/stall/sales
   ```
   - Should show sale of 2 units ✅

4. **Get Sales Summary**
   ```
   GET /api/stall/sales-summary
   ```
   - Should show totals by SKU ✅

---

### Step 11: Alerts
1. **Get Low Stock Alerts (Counter)**
   ```
   GET /api/alerts/low-stock
   ```
   - Should be empty (13 > threshold of 5)

2. **Sell More to Trigger Alert**
   Sell 9 more units (total 11 sold, 4 remaining)

3. **Get Low Stock Alerts Again**
   - Should show Butter Chicken Danish (4 < 5 threshold) ✅

4. **Get Low Raw Ingredients**
   ```
   GET /api/alerts/low-raw
   ```
   - Should show Chicken if < 3kg ✅

5. **Get All Alerts**
   ```
   GET /api/alerts
   ```
   - Should show both low stock and low raw ✅

---

## Testing Edge Cases

### 1. Insufficient Semi-Processed
**Test:** Try to send 100 Butter Chicken Danish when only 1100ml gravy available

```json
POST /api/kitchen/transfer
{
  "skuId": "<SKU_ID>",
  "quantity": 100
}
```

**Expected:** Error "Insufficient Butter Chicken Gravy: need 6000ml, have 1100ml"

---

### 2. Insufficient Raw Ingredients
**Test:** Update Chicken to 0.2kg, try to cook batch

1. Update Chicken stock:
   ```json
   PUT /api/admin/raw-ingredients/<CHICKEN_ID>
   {
     "currentStock": 0.2
   }
   ```

2. Try to cook:
   ```json
   POST /api/kitchen/batch-cook
   {
     "recipeId": "<RECIPE_ID>",
     "multiplier": 2
   }
   ```

**Expected:** Error "Insufficient Chicken: need 1kg, have 0.2kg"

---

### 3. Insufficient Counter Stock
**Test:** Try to sell 20 units when only 4 in stock

```json
POST /api/stall/sale
{
  "skuId": "<SKU_ID>",
  "quantity": 20
}
```

**Expected:** Error "Insufficient stock at stall: need 20, have 4"

---

### 4. Deprecated Endpoint (Receive Transfer)
**Test:** Try to call the deprecated receive endpoint

```
POST /api/stall/receive-transfer/<ANY_ID>
{
  "receivedBy": "Stall Staff"
}
```

**Expected:** HTTP 410 Gone with message "This endpoint is deprecated..."

---

## Final Inventory Balance Check

After all tests, verify the complete flow:

**Raw:**
- Chicken: 9 kg (10 - 1 from batch) ✅
- Masala: 4000 g (5000 - 1000 from batch) ✅

**Semi-Processed:**
- Butter Chicken Gravy: 1100 ml (2000 cooked - 900 sent) ✅
- Danish: 35 nos (50 - 15 sent) ✅
- Cheese: 2400 g (2700 - 300 sent) ✅

**Counter:**
- Butter Chicken Danish: 4 (15 sent - 11 sold) ✅

**Sales:**
- Total sold: 11 units ✅

---

## Success Criteria

✅ Raw ingredients only deducted during batch cooking
✅ Semi-processed added during batch cooking
✅ Semi-processed deducted when sending to counter
✅ **Counter stock updated INSTANTLY when kitchen sends**
✅ No pending transfers exist
✅ Sales deduct from counter stock only
✅ All alerts working correctly
✅ All edge cases handled with proper errors
✅ Complete audit trail in transfer logs

---

## Notes

- All transfers have status "completed" instantly
- No two-step process - kitchen send = counter receive
- Transfer logs are for audit trail only
- Counter staff never needs to "acknowledge" receipt
- System matches real QSR operations (single action)