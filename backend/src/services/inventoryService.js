import RawIngredient from '../models/RawIngredient.js';
import SemiProcessedItem from '../models/SemiProcessedItem.js';
import SemiProcessedRecipe from '../models/SemiProcessedRecipe.js';
import SkuItem from '../models/SkuItem.js';
import SkuRecipe from '../models/SkuRecipe.js';
import BatchCookingLog from '../models/BatchCookingLog.js';
import TransferLog from '../models/TransferLog.js';
import SalesLog from '../models/SalesLog.js';
import { logActivity } from './logService.js';

/**
 * Cook a batch of semi-processed items
 * Deducts raw ingredients and adds to semi-processed inventory
 */
export const cookBatch = async (recipeId, multiplier = 1, createdBy = 'Kitchen Staff') => {
  const recipe = await SemiProcessedRecipe.findById(recipeId);
  if (!recipe) {
    throw new Error('Recipe not found');
  }

  const quantityToProduce = recipe.outputQuantity * multiplier;

  // Check raw ingredient availability
  for (const ingredient of recipe.ingredients) {
    const rawIngredient = await RawIngredient.findById(ingredient.rawIngredientId);
    if (!rawIngredient) {
      throw new Error(`Raw ingredient ${ingredient.rawIngredientName} not found`);
    }

    const requiredQty = ingredient.quantity * multiplier;
    if (rawIngredient.currentStock < requiredQty) {
      throw new Error(
        `Insufficient ${ingredient.rawIngredientName}: need ${requiredQty}${ingredient.unit}, have ${rawIngredient.currentStock}${rawIngredient.unit}`
      );
    }
  }

  // Generate batch ID
  const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Deduct raw ingredients
  const rawIngredientsUsed = [];
  for (const ingredient of recipe.ingredients) {
    const requiredQty = ingredient.quantity * multiplier;
    await RawIngredient.findByIdAndUpdate(
      ingredient.rawIngredientId,
      { $inc: { currentStock: -requiredQty }, updatedAt: new Date() }
    );
    rawIngredientsUsed.push({
      ingredientId: ingredient.rawIngredientId,
      ingredientName: ingredient.rawIngredientName,
      quantity: requiredQty,
      unit: ingredient.unit
    });
  }

  // Add to semi-processed inventory
  let semiProcessedItem = await SemiProcessedItem.findOne({ name: recipe.outputName });

  if (!semiProcessedItem) {
    // Create new semi-processed item if it doesn't exist
    semiProcessedItem = new SemiProcessedItem({
      name: recipe.outputName,
      type: 'batch',
      unit: recipe.outputUnit,
      currentStock: quantityToProduce,
      batches: [{
        batchId,
        quantity: quantityToProduce,
        createdAt: new Date()
      }]
    });
    await semiProcessedItem.save();
  } else {
    // Update existing semi-processed item
    semiProcessedItem.currentStock += quantityToProduce;
    semiProcessedItem.batches.push({
      batchId,
      quantity: quantityToProduce,
      createdAt: new Date()
    });
    semiProcessedItem.updatedAt = new Date();
    await semiProcessedItem.save();
  }

  // Create batch cooking log
  const log = new BatchCookingLog({
    semiProcessedRecipeId: recipeId,
    outputName: recipe.outputName,
    quantityProduced: quantityToProduce,
    unit: recipe.outputUnit,
    batchId,
    rawIngredientsUsed,
    createdBy
  });
  await log.save();

  // Log activity
  await logActivity(
    'BATCH_COOKED',
    'KITCHEN',
    `Cooked ${quantityToProduce}${recipe.outputUnit} of ${recipe.outputName}`,
    {
      batchId,
      outputName: recipe.outputName,
      quantityProduced: quantityToProduce,
      unit: recipe.outputUnit,
      multiplier,
      rawIngredientsUsed
    },
    createdBy
  );

  return {
    success: true,
    batchId,
    outputName: recipe.outputName,
    quantityProduced: quantityToProduce,
    unit: recipe.outputUnit,
    log
  };
};

/**
 * Send SKUs to counter (SINGLE ACTION)
 * Deducts semi-processed inventory AND updates counter stock immediately
 * NO two-step process - counter stock available instantly
 */
export const sendToStall = async (skuId, quantity, sentBy = 'Kitchen Staff') => {
  const sku = await SkuItem.findById(skuId);
  if (!sku) {
    throw new Error('SKU item not found');
  }

  const skuRecipe = await SkuRecipe.findOne({ skuId });
  if (!skuRecipe) {
    throw new Error('SKU recipe not found');
  }

  // Calculate semi-processed needed
  const semiProcessedNeeded = skuRecipe.ingredients.map(ing => ({
    itemId: ing.semiProcessedId,
    itemName: ing.semiProcessedName,
    quantity: ing.quantity * quantity,
    unit: ing.unit
  }));

  // Check semi-processed availability
  for (const item of semiProcessedNeeded) {
    const semiProcessed = await SemiProcessedItem.findById(item.itemId);
    if (!semiProcessed) {
      throw new Error(`Semi-processed item ${item.itemName} not found`);
    }
    if (semiProcessed.currentStock < item.quantity) {
      throw new Error(
        `Insufficient ${item.itemName}: need ${item.quantity}${item.unit}, have ${semiProcessed.currentStock}${semiProcessed.unit}`
      );
    }
  }

  // DEDUCT semi-processed inventory
  for (const item of semiProcessedNeeded) {
    const semiProcessed = await SemiProcessedItem.findById(item.itemId);
    semiProcessed.currentStock -= item.quantity;
    semiProcessed.updatedAt = new Date();
    await semiProcessed.save();
  }

  // UPDATE COUNTER STOCK IMMEDIATELY (single action)
  await SkuItem.findByIdAndUpdate(
    skuId,
    {
      $inc: { currentStallStock: quantity },
      updatedAt: new Date()
    }
  );

  // Create transfer log for audit trail only
  const transfer = new TransferLog({
    status: 'completed',  // Instantly completed, no pending state
    skuId,
    skuName: sku.name,
    quantity,
    semiProcessedUsed: semiProcessedNeeded,
    sentAt: new Date(),
    sentBy,
    receivedAt: new Date(),  // Same time - instant
    receivedBy: 'Auto'  // Automatic
  });
  await transfer.save();

  // Log activity
  await logActivity(
    'SENT_TO_COUNTER',
    'KITCHEN',
    `Sent ${quantity} ${sku.name} to counter`,
    {
      skuId,
      skuName: sku.name,
      quantity,
      counterStock: sku.currentStallStock + quantity,
      semiProcessedUsed: semiProcessedNeeded
    },
    sentBy
  );

  return {
    success: true,
    transfer,
    counterStock: sku.currentStallStock + quantity
  };
};

/**
 * DEPRECATED: Receive transfer at stall
 * NOT NEEDED in the correct flow - counter stock updates instantly when kitchen sends
 * Kept only for potential manual adjustments or audit corrections
 */
export const receiveAtStall = async (transferId, receivedBy = 'Stall Staff') => {
  // This function is not part of normal operations
  // In the correct flow, sendToStall() updates counter stock immediately
  throw new Error('This endpoint is deprecated. Counter stock is updated automatically when kitchen sends SKUs.');
};

/**
 * Record a sale at the stall
 * Deducts from stall stock
 */
export const recordSale = async (skuId, quantity, soldBy = 'Stall Staff', customerName = '', customerPhone = '', paymentMethod = 'cash', transactionId = '') => {
  const sku = await SkuItem.findById(skuId);
  if (!sku) {
    throw new Error('SKU item not found');
  }

  if (sku.currentStallStock < quantity) {
    throw new Error(
      `Insufficient stock at stall: need ${quantity}, have ${sku.currentStallStock}`
    );
  }

  // Deduct from stall stock
  sku.currentStallStock -= quantity;
  await sku.save();

  // Create sales log
  const sale = new SalesLog({
    skuId,
    skuName: sku.name,
    quantity,
    price: sku.price,
    totalAmount: sku.price * quantity,
    soldBy,
    customerName,
    customerPhone,
    paymentMethod,
    transactionId
  });
  await sale.save();

  // Log activity
  await logActivity(
    'SALE_RECORDED',
    'STALL',
    `Sold ${quantity} ${sku.name} for ₹${sku.price * quantity}`,
    {
      saleId: sale._id,
      skuId,
      skuName: sku.name,
      quantity,
      price: sku.price,
      totalAmount: sku.price * quantity,
      customerName,
      customerPhone,
      paymentMethod,
      remainingStock: sku.currentStallStock
    },
    soldBy
  );

  return {
    success: true,
    sale,
    remainingStock: sku.currentStallStock
  };
};

/**
 * Check if enough semi-processed items are available for a transfer
 */
export const checkSemiProcessedAvailability = async (skuId, quantity) => {
  const skuRecipe = await SkuRecipe.findOne({ skuId });
  if (!skuRecipe) {
    throw new Error('SKU recipe not found');
  }

  const availability = [];
  let allAvailable = true;

  for (const ingredient of skuRecipe.ingredients) {
    const required = ingredient.quantity * quantity;
    const semiProcessed = await SemiProcessedItem.findById(ingredient.semiProcessedId);

    const available = semiProcessed ? semiProcessed.currentStock : 0;
    const isAvailable = available >= required;

    availability.push({
      itemName: ingredient.semiProcessedName,
      required,
      available,
      unit: ingredient.unit,
      isAvailable
    });

    if (!isAvailable) {
      allAvailable = false;
    }
  }

  return {
    allAvailable,
    items: availability
  };
};
