import SkuItem from '../models/SkuItem.js';
import RawIngredient from '../models/RawIngredient.js';

/**
 * Get SKUs with low stock at stall
 */
export const getLowStockSkus = async () => {
  const lowStockSkus = await SkuItem.find({
    $expr: { $lte: ['$currentStallStock', '$lowStockThreshold'] },
    isActive: true
  }).sort({ currentStallStock: 1 });

  return lowStockSkus.map(sku => ({
    _id: sku._id,
    name: sku.name,
    currentStock: sku.currentStallStock,
    threshold: sku.lowStockThreshold,
    deficit: Math.max(0, sku.lowStockThreshold - sku.currentStallStock + 5), // Suggest sending 5 more than threshold
    message: `Low stock: ${sku.name} has only ${sku.currentStallStock} at stall (threshold: ${sku.lowStockThreshold})`
  }));
};

/**
 * Get raw ingredients below reorder level
 */
export const getLowRawIngredients = async () => {
  const lowRawIngredients = await RawIngredient.find({
    $expr: { $lte: ['$currentStock', '$reorderLevel'] }
  }).sort({ currentStock: 1 });

  return lowRawIngredients.map(ingredient => ({
    _id: ingredient._id,
    name: ingredient.name,
    currentStock: ingredient.currentStock,
    reorderLevel: ingredient.reorderLevel,
    unit: ingredient.unit,
    canReplenish: ingredient.canReplenish,
    message: `Low stock: ${ingredient.name} has ${ingredient.currentStock}${ingredient.unit} (reorder at ${ingredient.reorderLevel}${ingredient.unit})`,
    severity: ingredient.canReplenish ? 'warning' : 'critical' // Critical for non-replenishable items
  }));
};

/**
 * Get all alerts (both low stock SKUs and low raw ingredients)
 */
export const getAllAlerts = async () => {
  const [lowStockSkus, lowRawIngredients] = await Promise.all([
    getLowStockSkus(),
    getLowRawIngredients()
  ]);

  return {
    lowStockSkus,
    lowRawIngredients,
    totalAlerts: lowStockSkus.length + lowRawIngredients.length
  };
};
