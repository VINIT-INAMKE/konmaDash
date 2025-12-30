import mongoose from 'mongoose';
import RawIngredient from '../models/RawIngredient.js';
import SemiProcessedItem from '../models/SemiProcessedItem.js';
import SemiProcessedRecipe from '../models/SemiProcessedRecipe.js';
import SkuItem from '../models/SkuItem.js';
import SkuRecipe from '../models/SkuRecipe.js';
import BatchCookingLog from '../models/BatchCookingLog.js';
import TransferLog from '../models/TransferLog.js';
import Transaction from '../models/Transaction.js';
import PurchasedGood from '../models/PurchasedGood.js';
import { logActivity } from './logService.js';

/**
 * Helper: Get model class for a given ingredient type
 */
const getModelForType = (ingredientType) => {
  switch (ingredientType) {
    case 'raw':
      return RawIngredient;
    case 'semiProcessed':
      return SemiProcessedItem;
    case 'purchasedGood':
      return PurchasedGood;
    default:
      throw new Error(`Unknown ingredient type: ${ingredientType}`);
  }
};

/**
 * Check if a batch has expired
 */
export const checkBatchExpiry = (batch) => {
  return new Date() > new Date(batch.expiresAt);
};

/**
 * Get batches expiring within X hours
 */
export const getExpiringBatches = async (hoursUntilExpiry = 4) => {
  const expiryThreshold = new Date(Date.now() + hoursUntilExpiry * 60 * 60 * 1000);

  const items = await SemiProcessedItem.find({
    'batches.expiresAt': { $lte: expiryThreshold }
  });

  const expiring = [];
  for (const item of items) {
    for (const batch of item.batches) {
      if (new Date(batch.expiresAt) <= expiryThreshold) {
        expiring.push({
          itemName: item.name,
          batchId: batch.batchId,
          quantity: batch.quantity,
          unit: item.unit,
          expiresAt: batch.expiresAt,
          isExpired: checkBatchExpiry(batch)
        });
      }
    }
  }

  return expiring;
};

/**
 * Remove expired batches from semi-processed items
 */
export const removeExpiredBatches = async () => {
  const items = await SemiProcessedItem.find({});
  const removed = [];

  for (const item of items) {
    const originalBatchCount = item.batches.length;
    let expiredQuantity = 0;

    // Filter out expired batches
    item.batches = item.batches.filter(batch => {
      if (checkBatchExpiry(batch)) {
        expiredQuantity += batch.quantity;
        removed.push({
          itemName: item.name,
          batchId: batch.batchId,
          quantity: batch.quantity,
          unit: item.unit,
          expiredAt: batch.expiresAt
        });
        return false;
      }
      return true;
    });

    // Update current stock
    if (expiredQuantity > 0) {
      item.currentStock = Math.max(0, item.currentStock - expiredQuantity);
      item.updatedAt = new Date();
      await item.save();
    }

    if (item.batches.length < originalBatchCount) {
      await logActivity(
        'BATCH_EXPIRED',
        'SYSTEM',
        `Removed ${originalBatchCount - item.batches.length} expired batch(es) of ${item.name}`,
        {
          itemName: item.name,
          expiredQuantity,
          unit: item.unit,
          batchesRemoved: originalBatchCount - item.batches.length
        },
        'System'
      );
    }
  }

  return removed;
};

/**
 * Cook a batch of semi-processed items
 * Supports polymorphic ingredients (raw, semiProcessed, purchasedGood)
 * Checks expiry for semi-processed batches
 * Uses FIFO batch consumption
 */
export const cookBatch = async (recipeId, multiplier = 1, createdBy = 'Kitchen Staff') => {
  const recipe = await SemiProcessedRecipe.findById(recipeId);
  if (!recipe) {
    throw new Error('Recipe not found');
  }

  const quantityToProduce = recipe.outputQuantity * multiplier;

  // Group ingredients by type
  const ingredientsByType = {
    raw: recipe.ingredients.filter(i => i.ingredientType === 'raw'),
    semiProcessed: recipe.ingredients.filter(i => i.ingredientType === 'semiProcessed'),
    purchasedGood: recipe.ingredients.filter(i => i.ingredientType === 'purchasedGood')
  };

  // Check availability for all ingredient types
  for (const type in ingredientsByType) {
    const ModelClass = getModelForType(type);

    for (const ingredient of ingredientsByType[type]) {
      const item = await ModelClass.findById(ingredient.ingredientId);
      if (!item) {
        throw new Error(`${ingredient.ingredientName} not found`);
      }

      const requiredQty = ingredient.quantity * multiplier;

      // For semi-processed items, check expiry of batches
      if (type === 'semiProcessed') {
        // Remove expired batches first
        const originalBatchCount = item.batches.length;
        let expiredQuantity = 0;

        item.batches = item.batches.filter(batch => {
          if (checkBatchExpiry(batch)) {
            expiredQuantity += batch.quantity;
            return false;
          }
          return true;
        });

        if (expiredQuantity > 0) {
          item.currentStock = Math.max(0, item.currentStock - expiredQuantity);
        }

        // Check if enough non-expired stock available
        const availableStock = item.batches.reduce((sum, b) => sum + b.quantity, 0);
        if (availableStock < requiredQty) {
          throw new Error(
            `Insufficient non-expired ${ingredient.ingredientName}: need ${requiredQty}${ingredient.unit}, have ${availableStock}${item.unit} (${expiredQuantity}${item.unit} expired)`
          );
        }
      } else {
        // For raw and purchased goods, simple stock check
        if (item.currentStock < requiredQty) {
          throw new Error(
            `Insufficient ${ingredient.ingredientName}: need ${requiredQty}${ingredient.unit}, have ${item.currentStock}${item.unit}`
          );
        }
      }
    }
  }

  // Generate batch ID
  const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Deduct ingredients and track usage
  const ingredientsUsed = [];

  for (const type in ingredientsByType) {
    const ModelClass = getModelForType(type);

    for (const ingredient of ingredientsByType[type]) {
      const requiredQty = ingredient.quantity * multiplier;
      const item = await ModelClass.findById(ingredient.ingredientId);

      if (type === 'semiProcessed') {
        // Use FIFO batch consumption for semi-processed
        let remaining = requiredQty;
        const batchesUsed = [];

        // Sort batches by createdAt (FIFO)
        item.batches.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        for (let i = 0; i < item.batches.length && remaining > 0; i++) {
          const batch = item.batches[i];
          const toUse = Math.min(batch.quantity, remaining);

          batch.quantity -= toUse;
          remaining -= toUse;

          batchesUsed.push({
            batchId: batch.batchId,
            quantityUsed: toUse
          });
        }

        // Remove empty batches
        item.batches = item.batches.filter(b => b.quantity > 0);
        item.currentStock -= requiredQty;
        item.updatedAt = new Date();
        await item.save();

      } else {
        // For raw and purchased goods, simple deduction
        await ModelClass.findByIdAndUpdate(
          ingredient.ingredientId,
          { $inc: { currentStock: -requiredQty }, updatedAt: new Date() }
        );
      }

      ingredientsUsed.push({
        ingredientType: ingredient.ingredientType,
        ingredientId: ingredient.ingredientId,
        ingredientRef: ingredient.ingredientRef,
        ingredientName: ingredient.ingredientName,
        quantity: requiredQty,
        unit: ingredient.unit
      });
    }
  }

  // Calculate batch expiry time
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + recipe.holdingTimeHours * 60 * 60 * 1000);

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
        createdAt,
        expiresAt
      }]
    });
    await semiProcessedItem.save();
  } else {
    // Update existing semi-processed item
    semiProcessedItem.currentStock += quantityToProduce;
    semiProcessedItem.batches.push({
      batchId,
      quantity: quantityToProduce,
      createdAt,
      expiresAt
    });
    semiProcessedItem.updatedAt = new Date();
    await semiProcessedItem.save();
  }

  // Create batch cooking log with polymorphic ingredients
  const log = new BatchCookingLog({
    semiProcessedRecipeId: recipeId,
    outputName: recipe.outputName,
    quantityProduced: quantityToProduce,
    unit: recipe.outputUnit,
    batchId,
    ingredientsUsed,
    createdBy
  });
  await log.save();

  // Log activity
  await logActivity(
    'BATCH_COOKED',
    'KITCHEN',
    `Cooked ${quantityToProduce}${recipe.outputUnit} of ${recipe.outputName} (expires: ${expiresAt.toLocaleString()})`,
    {
      batchId,
      outputName: recipe.outputName,
      quantityProduced: quantityToProduce,
      unit: recipe.outputUnit,
      multiplier,
      holdingTimeHours: recipe.holdingTimeHours,
      expiresAt,
      ingredientsUsed
    },
    createdBy
  );

  return {
    success: true,
    batchId,
    outputName: recipe.outputName,
    quantityProduced: quantityToProduce,
    unit: recipe.outputUnit,
    expiresAt,
    log
  };
};

/**
 * Send SKUs to counter (SINGLE ACTION)
 * Supports polymorphic ingredients and no-recipe SKUs
 * Deducts inventory AND updates counter stock immediately
 */
export const sendToStall = async (skuId, quantity, sentBy = 'Kitchen Staff') => {
  const sku = await SkuItem.findById(skuId);
  if (!sku) {
    throw new Error('SKU item not found');
  }

  const skuRecipe = await SkuRecipe.findOne({ skuId });

  // If no recipe or hasRecipe: false, just update counter stock
  if (!skuRecipe || !skuRecipe.hasRecipe) {
    await SkuItem.findByIdAndUpdate(
      skuId,
      {
        $inc: { currentStallStock: quantity },
        updatedAt: new Date()
      }
    );

    // Log activity for no-recipe SKU
    await logActivity(
      'SENT_TO_COUNTER',
      'KITCHEN',
      `Sent ${quantity} ${sku.name} to counter (no recipe)`,
      {
        skuId,
        skuName: sku.name,
        quantity,
        counterStock: sku.currentStallStock + quantity,
        hasRecipe: false
      },
      sentBy
    );

    return {
      success: true,
      counterStock: sku.currentStallStock + quantity,
      hasRecipe: false
    };
  }

  // Group ingredients by type
  const ingredientsByType = {
    raw: skuRecipe.ingredients.filter(i => i.ingredientType === 'raw'),
    semiProcessed: skuRecipe.ingredients.filter(i => i.ingredientType === 'semiProcessed'),
    purchasedGood: skuRecipe.ingredients.filter(i => i.ingredientType === 'purchasedGood')
  };

  // Check availability for all ingredient types
  for (const type in ingredientsByType) {
    const ModelClass = getModelForType(type);

    for (const ingredient of ingredientsByType[type]) {
      const item = await ModelClass.findById(ingredient.ingredientId);
      if (!item) {
        throw new Error(`${ingredient.ingredientName} not found`);
      }

      const requiredQty = ingredient.quantity * quantity;

      // For purchased goods, check if counterStock is available first
      if (type === 'purchasedGood' && item.counterStock !== undefined) {
        const totalAvailable = item.currentStock + item.counterStock;
        if (totalAvailable < requiredQty) {
          throw new Error(
            `Insufficient ${ingredient.ingredientName}: need ${requiredQty}${ingredient.unit}, have ${totalAvailable}${item.unit}`
          );
        }
      } else if (type === 'semiProcessed') {
        // For semi-processed, check non-expired batches
        let expiredQuantity = 0;
        const nonExpiredBatches = item.batches.filter(batch => {
          if (checkBatchExpiry(batch)) {
            expiredQuantity += batch.quantity;
            return false;
          }
          return true;
        });

        const availableStock = nonExpiredBatches.reduce((sum, b) => sum + b.quantity, 0);
        if (availableStock < requiredQty) {
          throw new Error(
            `Insufficient non-expired ${ingredient.ingredientName}: need ${requiredQty}${ingredient.unit}, have ${availableStock}${item.unit}`
          );
        }
      } else {
        // For raw ingredients and other types
        if (item.currentStock < requiredQty) {
          throw new Error(
            `Insufficient ${ingredient.ingredientName}: need ${requiredQty}${ingredient.unit}, have ${item.currentStock}${item.unit}`
          );
        }
      }
    }
  }

  // Deduct ingredients and track usage
  const ingredientsUsed = [];

  for (const type in ingredientsByType) {
    const ModelClass = getModelForType(type);

    for (const ingredient of ingredientsByType[type]) {
      const requiredQty = ingredient.quantity * quantity;
      const item = await ModelClass.findById(ingredient.ingredientId);

      if (type === 'purchasedGood' && item.counterStock !== undefined) {
        // For purchased goods, prefer counterStock if available
        if (item.counterStock >= requiredQty) {
          await ModelClass.findByIdAndUpdate(
            ingredient.ingredientId,
            { $inc: { counterStock: -requiredQty }, updatedAt: new Date() }
          );
        } else {
          // Use counterStock first, then currentStock
          const fromCounter = item.counterStock;
          const fromMain = requiredQty - fromCounter;

          await ModelClass.findByIdAndUpdate(
            ingredient.ingredientId,
            {
              $inc: { counterStock: -fromCounter, currentStock: -fromMain },
              updatedAt: new Date()
            }
          );
        }
      } else if (type === 'semiProcessed') {
        // Use FIFO batch consumption for semi-processed
        let remaining = requiredQty;

        // Filter and sort non-expired batches by createdAt (FIFO)
        const nonExpiredBatches = item.batches.filter(batch => !checkBatchExpiry(batch));
        nonExpiredBatches.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Use batches
        for (let i = 0; i < nonExpiredBatches.length && remaining > 0; i++) {
          const batch = nonExpiredBatches[i];
          const toUse = Math.min(batch.quantity, remaining);

          batch.quantity -= toUse;
          remaining -= toUse;
        }

        // Remove empty and expired batches
        item.batches = item.batches.filter(b => b.quantity > 0 && !checkBatchExpiry(b));
        item.currentStock -= requiredQty;
        item.updatedAt = new Date();
        await item.save();

      } else {
        // For raw ingredients, simple deduction
        await ModelClass.findByIdAndUpdate(
          ingredient.ingredientId,
          { $inc: { currentStock: -requiredQty }, updatedAt: new Date() }
        );
      }

      ingredientsUsed.push({
        ingredientType: ingredient.ingredientType,
        ingredientId: ingredient.ingredientId,
        ingredientRef: ingredient.ingredientRef,
        ingredientName: ingredient.ingredientName,
        quantity: requiredQty,
        unit: ingredient.unit
      });
    }
  }

  // UPDATE COUNTER STOCK IMMEDIATELY
  await SkuItem.findByIdAndUpdate(
    skuId,
    {
      $inc: { currentStallStock: quantity },
      updatedAt: new Date()
    }
  );

  // Create transfer log with polymorphic ingredients
  const transfer = new TransferLog({
    status: 'completed',
    skuId,
    skuName: sku.name,
    quantity,
    ingredientsUsed,
    sentAt: new Date(),
    sentBy,
    receivedAt: new Date(),
    receivedBy: 'Auto'
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
      ingredientsUsed
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
// Legacy function - now uses unified transaction system
export const recordSale = async (skuId, quantity, soldBy = 'Stall Staff', customerName = '', customerPhone = '', paymentMethod = 'cash', transactionId = '') => {
  // Convert single sale to transaction format
  const items = [{ skuId, quantity }];
  
  const result = await recordTransaction(items, soldBy, customerName, customerPhone, paymentMethod, transactionId);
  
  // Get remaining stock for legacy compatibility
  const sku = await SkuItem.findById(skuId);
  
  // Return in legacy format for backward compatibility
  return {
    success: result.success,
    sale: {
      _id: result.transaction._id,
      skuId,
      skuName: result.transaction.items[0].skuName,
      quantity,
      price: result.transaction.items[0].unitPrice,
      totalAmount: result.transaction.items[0].itemTotal,
      soldBy: result.transaction.soldBy,
      customerName: result.transaction.customerName,
      customerPhone: result.transaction.customerPhone,
      paymentMethod: result.transaction.paymentMethod,
      transactionId: result.transaction.transactionId,
      createdAt: result.transaction.createdAt
    },
    remainingStock: sku?.currentStallStock || 0
  };
};

/**
 * Check if enough ingredients are available for a SKU transfer
 * Supports polymorphic ingredients
 */
export const checkSemiProcessedAvailability = async (skuId, quantity) => {
  const skuRecipe = await SkuRecipe.findOne({ skuId });
  if (!skuRecipe) {
    throw new Error('SKU recipe not found');
  }

  // If no recipe, return true
  if (!skuRecipe.hasRecipe || !skuRecipe.ingredients || skuRecipe.ingredients.length === 0) {
    return {
      allAvailable: true,
      hasRecipe: false,
      items: []
    };
  }

  const availability = [];
  let allAvailable = true;

  for (const ingredient of skuRecipe.ingredients) {
    const required = ingredient.quantity * quantity;
    const ModelClass = getModelForType(ingredient.ingredientType);
    const item = await ModelClass.findById(ingredient.ingredientId);

    let available = 0;
    let expired = 0;

    if (item) {
      if (ingredient.ingredientType === 'semiProcessed') {
        // For semi-processed, calculate non-expired stock
        const nonExpiredBatches = item.batches.filter(batch => !checkBatchExpiry(batch));
        available = nonExpiredBatches.reduce((sum, b) => sum + b.quantity, 0);

        const expiredBatches = item.batches.filter(batch => checkBatchExpiry(batch));
        expired = expiredBatches.reduce((sum, b) => sum + b.quantity, 0);
      } else if (ingredient.ingredientType === 'purchasedGood' && item.counterStock !== undefined) {
        // For purchased goods, include both main and counter stock
        available = item.currentStock + item.counterStock;
      } else {
        // For raw ingredients
        available = item.currentStock;
      }
    }

    const isAvailable = available >= required;

    availability.push({
      ingredientType: ingredient.ingredientType,
      itemName: ingredient.ingredientName,
      required,
      available,
      expired: expired || 0,
      unit: ingredient.unit,
      isAvailable
    });

    if (!isAvailable) {
      allAvailable = false;
    }
  }

  return {
    allAvailable,
    hasRecipe: true,
    items: availability
  };
};

/**
 * Record a multi-item transaction at the stall (DEPRECATED - use recordTransaction)
 * Legacy function for backward compatibility
 */
/**
 * Record a unified transaction (handles both single and multi-item sales)
 * Creates one Transaction record as the single source of truth
 * All operations are atomic - either all succeed or all fail
 */
export const recordTransaction = async (items, soldBy = 'Stall Staff', customerName = '', customerPhone = '', paymentMethod = 'cash', paymentTransactionId = '') => {
  // Validate items structure
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Transaction must contain at least one item');
  }

  // Validate each item
  for (const item of items) {
    if (!item.skuId || !item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
      throw new Error('Each item must have a valid skuId and quantity >= 1');
    }
  }

  // Start a transaction for atomic operations
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const processedItems = [];
    let totalAmount = 0;

    // Process each item
    for (const item of items) {
      const { skuId, quantity } = item;

      // Get SKU details
      const sku = await SkuItem.findById(skuId).session(session);
      if (!sku) {
        throw new Error(`SKU item not found: ${skuId}`);
      }

      if (sku.currentStallStock < quantity) {
        throw new Error(
          `Insufficient stock for ${sku.name}: need ${quantity}, have ${sku.currentStallStock}`
        );
      }

      // Deduct from stall stock
      sku.currentStallStock -= quantity;
      await sku.save({ session });

      const itemTotal = sku.price * quantity;
      totalAmount += itemTotal;

      processedItems.push({
        skuId,
        skuName: sku.name,
        quantity,
        unitPrice: sku.price,
        itemTotal
      });
    }

    // Determine transaction type
    const transactionType = items.length === 1 ? 'single_item' : 'cart';

    // Create unified transaction record
    const transaction = new Transaction({
      items: processedItems,
      totalAmount,
      soldBy,
      customerName,
      customerPhone,
      paymentMethod,
      paymentTransactionId: paymentTransactionId || '',
      transactionType
    });
    await transaction.save({ session });

    // Log activity for the transaction
    await logActivity(
      'SALE_RECORDED',
      'STALL',
      `Sold ${processedItems.length} different items (${processedItems.map(i => `${i.quantity}x ${i.skuName}`).join(', ')}) for ₹${totalAmount}`,
      {
        transactionId: transaction.transactionId,
        totalAmount,
        itemCount: items.length,
        transactionType
      },
      soldBy
    );

    // Commit the transaction
    await session.commitTransaction();

    return {
      success: true,
      transaction,
      totalAmount,
      itemCount: items.length
    };

  } catch (error) {
    // Rollback the transaction
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Legacy function - now uses unified transaction system
export const recordCartSale = async (cartItems, soldBy = 'Stall Staff', customerName = '', customerPhone = '', paymentMethod = 'cash', transactionId = '') => {
  // Use the unified transaction system
  const result = await recordTransaction(cartItems, soldBy, customerName, customerPhone, paymentMethod, transactionId);
  
  // Return in legacy format for backward compatibility
  return {
    success: result.success,
    cartSale: result.transaction, // Return transaction as cartSale for legacy compatibility
    totalAmount: result.totalAmount,
    itemCount: result.itemCount
  };
};
