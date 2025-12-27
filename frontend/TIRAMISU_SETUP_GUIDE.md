# Tiramisu Menu Items - Complete Setup Guide

This guide walks you through setting up two tiramisu variants in the QSR Inventory Management System.

## Menu Items Overview

### 1. Shrewsbury Tiramisu
**Final Components:**
- Shrewsbury Biscuit: 2 nos
- Tiramisu Cream: 49g
- Strong Cold Coffee: 10ml
- Cocoa Powder: 1g

**Cream Recipe (49g):**
- Mascarpone Cheese: 40g
- Whipping Cream: 20ml
- Sugar Powdered: 9g
- Vanilla Essence: (as needed)

---

### 2. Spiced Ginger Tiramisu
**Final Components:**
- Ginger Biscuits: 2 nos
- Spiced Ginger Cream: 51g
- Milked Coffee: 20ml
- Cocoa Powder: 1g
- Orange Zest: (as needed)

**Cream Recipe (51g):**
- Mascarpone Cheese: 40g
- Whipping Cream: 20ml
- Sugar Powdered: 11g
- Vanilla Essence: (as needed)
- Orange Zest: (as needed)

**Milked Coffee Recipe (20ml):**
- Strong Coffee: 12ml
- Milk: 8ml

---

## ADMIN PANEL - Setup

### Step 1: Add Raw Ingredients

Navigate to **Admin → Raw Ingredients** and add:

| Ingredient | Unit | Current Stock | Reorder Level | Can Replenish |
|------------|------|---------------|---------------|---------------|
| Mascarpone Cheese | grams | 2000 | 500 | Yes |
| Whipping Cream | ml | 1000 | 200 | Yes |
| Sugar Powdered | grams | 3000 | 500 | Yes |
| Vanilla Essence | ml | 100 | 20 | Yes |
| Orange Zest | grams | 50 | 10 | Yes |
| Strong Coffee | ml | 1000 | 200 | Yes |
| Milk | ml | 2000 | 500 | Yes |

---

### Step 2: Add Semi-Processed Items

Navigate to **Admin → Semi-Processed Items** and add:

#### Pre-made Items (Fixed/Batch with initial stock):

| Item | Type | Unit | Current Stock |
|------|------|------|---------------|
| Shrewsbury Biscuit | Batch | pieces | 200 |
| Ginger Biscuits | Batch | pieces | 200 |
| Cocoa Powder | Batch | grams | 500 |

#### Items to be produced (will be created via recipes):

| Item | Type | Unit | Current Stock |
|------|------|------|---------------|
| Tiramisu Cream | Batch | grams | 0 |
| Spiced Ginger Cream | Batch | grams | 0 |
| Milked Coffee | Batch | ml | 0 |

---

### Step 3: Create Semi-Processed Recipes

Navigate to **Admin → Semi-Processed Recipes** and create these recipes:

#### Recipe 1: Tiramisu Cream
- **Output Item:** Tiramisu Cream
- **Output Quantity:** 49
- **Output Unit:** grams
- **Ingredients:**
  - Mascarpone Cheese: 40 grams
  - Whipping Cream: 20 ml
  - Sugar Powdered: 9 grams
  - Vanilla Essence: 1 ml (adjust as needed)

#### Recipe 2: Spiced Ginger Cream
- **Output Item:** Spiced Ginger Cream
- **Output Quantity:** 51
- **Output Unit:** grams
- **Ingredients:**
  - Mascarpone Cheese: 40 grams
  - Whipping Cream: 20 ml
  - Sugar Powdered: 11 grams
  - Vanilla Essence: 1 ml (adjust as needed)
  - Orange Zest: 1 grams (adjust as needed)

#### Recipe 3: Milked Coffee
- **Output Item:** Milked Coffee
- **Output Quantity:** 20
- **Output Unit:** ml
- **Ingredients:**
  - Strong Coffee: 12 ml
  - Milk: 8 ml

---

### Step 4: Create SKU Items

Navigate to **Admin → SKU Items** and add:

#### SKU 1: Shrewsbury Tiramisu
- **Name:** Shrewsbury Tiramisu
- **Target SKUs:** 50
- **Current Stall Stock:** 0
- **Low Stock Threshold:** 5
- **Price:** ₹150
- **Active:** Yes

#### SKU 2: Spiced Ginger Tiramisu
- **Name:** Spiced Ginger Tiramisu
- **Target SKUs:** 50
- **Current Stall Stock:** 0
- **Low Stock Threshold:** 5
- **Price:** ₹180
- **Active:** Yes

---

### Step 5: Create SKU Recipes

Navigate to **Admin → SKU Recipes** and create:

#### Recipe for: Shrewsbury Tiramisu
- **Ingredients:**
  - Shrewsbury Biscuit: 2 pieces
  - Tiramisu Cream: 49 grams
  - Strong Cold Coffee: 10 ml
  - Cocoa Powder: 1 grams

#### Recipe for: Spiced Ginger Tiramisu
- **Ingredients:**
  - Ginger Biscuits: 2 pieces
  - Spiced Ginger Cream: 51 grams
  - Milked Coffee: 20 ml
  - Cocoa Powder: 1 grams

---

## KITCHEN PANEL - Production

### Scenario: Prepare 10 servings of each tiramisu

#### Step 1: Batch Cook Tiramisu Cream

Navigate to **Kitchen → Batch Cooking**

1. **Select Recipe:** Tiramisu Cream
2. **Multiplier:** 10 (produces 490g = 10 servings)
3. **Created By:** Kitchen Staff
4. **Click:** Cook Batch

**What happens:**
- ✅ Deducts from raw ingredients:
  - Mascarpone Cheese: -400g
  - Whipping Cream: -200ml
  - Sugar Powdered: -90g
  - Vanilla Essence: -10ml
- ✅ Adds to semi-processed inventory:
  - Tiramisu Cream: +490g

---

#### Step 2: Batch Cook Spiced Ginger Cream

Navigate to **Kitchen → Batch Cooking**

1. **Select Recipe:** Spiced Ginger Cream
2. **Multiplier:** 10 (produces 510g = 10 servings)
3. **Created By:** Kitchen Staff
4. **Click:** Cook Batch

**What happens:**
- ✅ Deducts from raw ingredients:
  - Mascarpone Cheese: -400g
  - Whipping Cream: -200ml
  - Sugar Powdered: -110g
  - Vanilla Essence: -10ml
  - Orange Zest: -10g
- ✅ Adds to semi-processed inventory:
  - Spiced Ginger Cream: +510g

---

#### Step 3: Batch Cook Milked Coffee

Navigate to **Kitchen → Batch Cooking**

1. **Select Recipe:** Milked Coffee
2. **Multiplier:** 10 (produces 200ml = 10 servings)
3. **Created By:** Kitchen Staff
4. **Click:** Cook Batch

**What happens:**
- ✅ Deducts from raw ingredients:
  - Strong Coffee: -120ml
  - Milk: -80ml
- ✅ Adds to semi-processed inventory:
  - Milked Coffee: +200ml

---

#### Step 4: Send Shrewsbury Tiramisu to Counter

Navigate to **Kitchen → Send to Counter**

1. **Select SKU:** Shrewsbury Tiramisu
2. **Quantity:** 10
3. **Sent By:** Kitchen Staff
4. **Click:** Send to Counter

**What happens:**
- ✅ Deducts from semi-processed inventory:
  - Shrewsbury Biscuit: -20 pieces
  - Tiramisu Cream: -490g
  - Strong Cold Coffee: -100ml
  - Cocoa Powder: -10g
- ✅ Updates counter stock immediately:
  - Shrewsbury Tiramisu: +10 units

---

#### Step 5: Send Spiced Ginger Tiramisu to Counter

Navigate to **Kitchen → Send to Counter**

1. **Select SKU:** Spiced Ginger Tiramisu
2. **Quantity:** 10
3. **Sent By:** Kitchen Staff
4. **Click:** Send to Counter

**What happens:**
- ✅ Deducts from semi-processed inventory:
  - Ginger Biscuits: -20 pieces
  - Spiced Ginger Cream: -510g
  - Milked Coffee: -200ml
  - Cocoa Powder: -10g
- ✅ Updates counter stock immediately:
  - Spiced Ginger Tiramisu: +10 units

---

## STALL PANEL - Sales

### Step 1: Record Sale - Shrewsbury Tiramisu

Navigate to **Stall → Record Sale**

1. **Select SKU:** Shrewsbury Tiramisu
2. **Quantity:** 1
3. **Sold By:** Stall Staff Name
4. **Customer Name:** Rajesh Kumar (optional)
5. **Customer Phone:** 9876543210 (optional)
6. **Payment Method:** UPI
7. **Click:** Record Sale

**What happens:**
- ✅ Deducts from counter stock:
  - Shrewsbury Tiramisu: -1 unit
- ✅ Creates sales log with:
  - Total Amount: ₹150
  - Customer details
  - Payment method
- ✅ Generates printable receipt
- ✅ Click **Print Receipt** to print the bill

---

### Step 2: Record Sale - Spiced Ginger Tiramisu

Navigate to **Stall → Record Sale**

1. **Select SKU:** Spiced Ginger Tiramisu
2. **Quantity:** 2
3. **Sold By:** Stall Staff Name
4. **Customer Name:** Priya Sharma (optional)
5. **Customer Phone:** 9123456789 (optional)
6. **Payment Method:** Card
7. **Click:** Record Sale

**What happens:**
- ✅ Deducts from counter stock:
  - Spiced Ginger Tiramisu: -2 units
- ✅ Creates sales log with:
  - Total Amount: ₹360 (₹180 × 2)
  - Customer details
  - Payment method
- ✅ Generates printable receipt
- ✅ Click **Print Receipt** to print the bill

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    RAW INGREDIENTS                          │
│  Mascarpone, Cream, Sugar, Vanilla, Orange, Coffee, Milk   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ [Kitchen: Batch Cook Recipes]
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  SEMI-PROCESSED ITEMS                       │
│  Cooked: Tiramisu Cream, Spiced Ginger Cream, Milked Coffee│
│  Pre-made: Biscuits, Cocoa Powder                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ [Kitchen: Send to Counter]
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   COUNTER STOCK (SKUs)                      │
│        Shrewsbury Tiramisu, Spiced Ginger Tiramisu         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ [Stall: Record Sale]
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      CUSTOMER                               │
│              (Receives receipt with bill)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Inventory Tracking at Each Stage

### After Admin Setup:
```
RAW INGREDIENTS:
✓ Mascarpone Cheese: 2000g
✓ Whipping Cream: 1000ml
✓ Sugar Powdered: 3000g
✓ Vanilla Essence: 100ml
✓ Orange Zest: 50g
✓ Strong Coffee: 1000ml
✓ Milk: 2000ml

SEMI-PROCESSED:
✓ Shrewsbury Biscuit: 200 pieces
✓ Ginger Biscuits: 200 pieces
✓ Cocoa Powder: 500g
✓ Tiramisu Cream: 0g
✓ Spiced Ginger Cream: 0g
✓ Milked Coffee: 0ml

COUNTER STOCK:
✓ Shrewsbury Tiramisu: 0 units
✓ Spiced Ginger Tiramisu: 0 units
```

### After Kitchen Production (10 each):
```
RAW INGREDIENTS:
✓ Mascarpone Cheese: 1200g (-800g)
✓ Whipping Cream: 600ml (-400ml)
✓ Sugar Powdered: 2800g (-200g)
✓ Vanilla Essence: 80ml (-20ml)
✓ Orange Zest: 40g (-10g)
✓ Strong Coffee: 880ml (-120ml)
✓ Milk: 1920ml (-80ml)

SEMI-PROCESSED:
✓ Shrewsbury Biscuit: 180 pieces (-20)
✓ Ginger Biscuits: 180 pieces (-20)
✓ Cocoa Powder: 480g (-20g)
✓ Tiramisu Cream: 0g (+490g -490g)
✓ Spiced Ginger Cream: 0g (+510g -510g)
✓ Milked Coffee: 0ml (+200ml -200ml)
✓ Strong Cold Coffee: 900ml (-100ml)

COUNTER STOCK:
✓ Shrewsbury Tiramisu: 10 units
✓ Spiced Ginger Tiramisu: 10 units
```

### After Sales (1 Shrewsbury + 2 Ginger):
```
COUNTER STOCK:
✓ Shrewsbury Tiramisu: 9 units (-1)
✓ Spiced Ginger Tiramisu: 8 units (-2)

SALES RECORDS:
✓ Sale 1: Shrewsbury Tiramisu × 1 = ₹150
✓ Sale 2: Spiced Ginger Tiramisu × 2 = ₹360
✓ Total Revenue: ₹510
```

---

## Important Notes

1. **Pre-made Items**: Shrewsbury Biscuits, Ginger Biscuits, and Cocoa Powder are added directly to semi-processed inventory with initial stock.

2. **Batch Cooking Order**: Always cook creams and milked coffee BEFORE sending SKUs to counter, as they are required ingredients.

3. **Stock Management**: The system automatically checks availability at each step and prevents operations if insufficient stock.

4. **Counter Stock**: Updates immediately when kitchen sends items - no two-step process.

5. **Receipt Generation**: Automatically generated after each sale with customer details and can be printed.

6. **Strong Cold Coffee**: This is already available as a raw ingredient (pre-made), so it's used directly for Shrewsbury Tiramisu without needing a recipe.

---

## Testing Checklist

- [ ] All raw ingredients added with sufficient stock
- [ ] All semi-processed items created (pre-made with stock, recipes with 0 stock)
- [ ] All 3 semi-processed recipes created (Tiramisu Cream, Spiced Ginger Cream, Milked Coffee)
- [ ] Both SKU items created with prices
- [ ] Both SKU recipes created with correct ingredients
- [ ] Batch cook all 3 recipes (creams and milked coffee)
- [ ] Verify semi-processed inventory updated correctly
- [ ] Send both SKUs to counter
- [ ] Verify counter stock updated to 10 each
- [ ] Record sale for Shrewsbury Tiramisu
- [ ] Verify receipt generated correctly
- [ ] Record sale for Spiced Ginger Tiramisu
- [ ] Verify all stock levels are correct
- [ ] Print and verify receipt formatting

---

*Generated for Konma Xperience Centre*
*QSR Inventory Management System*
