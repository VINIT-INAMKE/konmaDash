# FINAL, COMPLETE & OPTIMAL FLOW

(Raw → Semi-Processed → Counter SKUs → Sales → Auto Replenishment)

This is the version that is operationally correct AND scalable.

## 0. CORE DESIGN RULE (VERY IMPORTANT)

**Raw ingredients are NEVER touched during service decisions.**

They are consumed only during batch cooking, not during SKU assembly or sales.

🔒 This single rule prevents 80% of errors.

---

## 1. FOUNDATION (LOCKED MASTER DATA)

### 1.1 SKU Recipe Master (Portion Control)

Defines what goes into 1 SKU.

**Example: Butter Chicken Danish**
- Butter Chicken gravy: 60 ml
- Danish pastry: 1 no (45 g)
- Grated cheese: 20 g

🔒 Fixed. Version-controlled.

**Database:** `skuRecipes` collection

### 1.2 Semi-Processed Recipe Master (RAW → YIELD)

Defines how raw ingredients convert into semi-processed items.

**Example: Butter Chicken – 1000 ml**
- Raw chicken: 500 g
- Butter masala base: 500 g

📌 This is the only place where raw ingredients are referenced.

**Database:** `semiProcessedRecipes` collection

---

## 2. RAW INGREDIENT INVENTORY (KITCHEN ONLY)

**What is tracked:**
- Chicken (kg)
- Onion, tomato base
- Butter, cream
- Spices
- Cheese blocks
- Milk, sugar, chocolate

**Tracked As:**
- Opening
- Received
- Used (only via batch cooking)
- Closing
- Reorder level

🚫 **Raw inventory is never reduced by sales or SKU prep directly.**

**Database:** `rawIngredients` collection

---

## 3. KITCHEN: SEMI-PROCESSED PREP (BATCH COOKING)

**Action:** Cook a Batch

**Example:** Cook 2000 ml Butter Chicken

**System Automatically:**
1. Creates a Butter Chicken batch
   - Qty: 2000 ml
   - Date & time
   - Batch ID
2. Deducts raw ingredients:
   - Chicken: 1000 g
   - Gravy base: 1000 g

📌 **Raw → Semi conversion happens only here.**

**API:** `POST /api/kitchen/batch-cook`

```json
{
  "recipeId": "abc123",
  "multiplier": 2,
  "createdBy": "Chef Ram"
}
```

**Database Changes:**
- `rawIngredients`: Stock decreased
- `semiProcessedItems`: Stock increased, batch added
- `batchCookingLogs`: New log created

---

## 4. KITCHEN → COUNTER (SEND SKUs – SINGLE ACTION)

**Action:** Send X SKUs to Counter

**Example:** Send 15 Butter Chicken Danish

**System Auto-Does:**
1. Deducts semi-processed inventory:
   - Butter Chicken: 900 ml
2. Deducts fixed semi-processed items:
   - Danish: 15 nos
   - Cheese: 300 g
3. **Creates Counter Stock = 15** ✅ INSTANTLY

❌ **No finished SKU inventory inside kitchen**
❌ **No raw inventory touched here**
✅ **Counter stock updated IMMEDIATELY - no pending state**

**API:** `POST /api/kitchen/transfer`

```json
{
  "skuId": "xyz789",
  "quantity": 15,
  "sentBy": "Kitchen Staff"
}
```

**Database Changes:**
- `semiProcessedItems`: Stock decreased
- `skuItems.currentStallStock`: Increased by 15
- `transferLogs`: New log with status='completed'

**Response:**
```json
{
  "success": true,
  "transfer": { ... },
  "counterStock": 15
}
```

---

## 5. COUNTER (SELL ONLY)

**Counter Action:** Sell SKU → Counter stock reduces

**Example:** Sold 9 BC Danish → Counter stock = 6

❌ **No inventory decisions made here.**

**API:** `POST /api/stall/sale`

```json
{
  "skuId": "xyz789",
  "quantity": 2,
  "soldBy": "Cashier 1"
}
```

**Database Changes:**
- `skuItems.currentStallStock`: Decreased by 2
- `salesLogs`: New log created

---

## 6. LIVE REPLENISHMENT LOGIC (SMART + SAFE)

### 6.1 Coverage-Based Alerts

**System tracks:**
- Sales velocity
- Remaining counter stock
- Minutes of cover

**Alert Example:**
🔴 Send 10 Butter Chicken Danish (15 min cover remaining)

**No mention of:**
- Raw ingredients
- Recipes
- Batch math

**API:** `GET /api/alerts/low-stock`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "xyz789",
      "name": "Butter Chicken Danish",
      "currentStock": 6,
      "threshold": 5,
      "deficit": 10,
      "message": "Low stock: Butter Chicken Danish has only 6 at stall (threshold: 5)"
    }
  ]
}
```

---

## 7. KITCHEN RESPONSE (AUTOMATED CHECKS)

When alert is received, system checks in this order:

### 1️⃣ Semi-Processed Availability

Butter Chicken available?
- Yes → proceed
- No → cook new batch

### 2️⃣ Raw Ingredient Sufficiency (ONLY IF BATCH NEEDED)

If batch required:
- Chicken available?
- Gravy base available?

If not:
⚠️ Raw chicken low – cannot prep Butter Chicken

### 3️⃣ Fixed Items Check

- Danish?
- Cheese?

**API:** `GET /api/kitchen/check-availability?skuId=xyz789&quantity=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "allAvailable": true,
    "items": [
      {
        "itemName": "Butter Chicken Gravy",
        "required": 600,
        "available": 1400,
        "unit": "ml",
        "isAvailable": true
      },
      ...
    ]
  }
}
```

---

## 8. RAW INGREDIENT REPLENISHMENT (BACK-END, NOT SERVICE)

Raw ingredient reorder is based on:
- Batch cooking history
- Projected demand
- Safety stock

**Example:**
- Avg Butter Chicken usage/day = 4 L
- Chicken needed/day = 2 kg
- Reorder when < 6 kg

🚫 **Raw stock alerts do not interrupt service flow.**

**API:** `GET /api/alerts/low-raw`

---

## 9. WASTAGE & LOSSES (CONTROLLED ENTRY)

**Where wastage is logged:**
- Raw (spoilage)
- Semi-processed (expired batch)
- Counter SKU (damaged)

**Each entry improves:**
- Yield accuracy
- Forecasting
- Cost control

*Note: Wastage tracking not implemented in MVP*

---

## 10. WHY THIS FLOW IS BOTH COMPLETE & FOOL-PROOF

✅ Raw ingredients fully tracked
✅ Raw never touched during sales
✅ Batches protect food safety
✅ Counter remains simple
✅ Kitchen decisions are binary (cook / send)
✅ Errors are contained, not cascading
✅ **No pending states** - counter stock updates instantly
✅ **Single action** - kitchen send = counter receive

---

## 11. SIMPLE STAFF MENTAL MODEL

- **Raw** → only for cooking
- **Batches** → only in kitchen
- **SKUs** → only at counter
- **Sales** → trigger everything

**Kitchen Staff:** Cook batches, send to counter (instant)
**Counter Staff:** Sell only, check stock, request more if low

---

## COMPLETE FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    RAW INGREDIENTS                          │
│          (Chicken, Masala, Danish, Cheese)                  │
│                                                             │
│  [Only touched during batch cooking]                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Batch Cook
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                SEMI-PROCESSED ITEMS                         │
│       (Butter Chicken Gravy, Danish, Cheese)                │
│                                                             │
│  [Inventory tracked with batches]                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Send to Counter (SINGLE ACTION)
                   │ ✅ Deduct semi-processed
                   │ ✅ Add to counter stock
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  COUNTER STOCK (SKUs)                       │
│               (Butter Chicken Danish: 15)                   │
│                                                             │
│  [Ready to sell - no pending state]                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Sale
                   │ ✅ Deduct counter stock
                   │ ✅ Log sale
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     SALES LOG                               │
│              (Customer purchases tracked)                    │
│                                                             │
│  [History for reporting & replenishment]                    │
└─────────────────────────────────────────────────────────────┘
```

---

## TESTING THE CORRECT FLOW

**Initial State:**
- Raw: 10kg Chicken, 5000g Masala
- Semi-Processed: 0ml Gravy, 50 Danish, 2700g Cheese
- Counter: 0 SKUs

**Step 1: Cook Batch (2000ml Butter Chicken)**
- Raw: 9kg Chicken, 4000g Masala
- Semi-Processed: 2000ml Gravy, 50 Danish, 2700g Cheese
- Counter: 0 SKUs

**Step 2: Send 15 SKUs to Counter (SINGLE ACTION)**
- Raw: 9kg Chicken, 4000g Masala
- Semi-Processed: 1100ml Gravy, 35 Danish, 2400g Cheese
- Counter: **15 SKUs** ✅ INSTANT

**Step 3: Sell 2 SKUs**
- Raw: 9kg Chicken, 4000g Masala
- Semi-Processed: 1100ml Gravy, 35 Danish, 2400g Cheese
- Counter: **13 SKUs**

**Balance Confirmed:**
- 900ml Gravy consumed (15 × 60ml) ✅
- 15 Danish consumed (15 × 1) ✅
- 300g Cheese consumed (15 × 20g) ✅
- Counter stock accurate ✅
