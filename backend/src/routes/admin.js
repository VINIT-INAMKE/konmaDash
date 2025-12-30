import express from 'express';
import {
  createRawIngredient,
  getAllRawIngredients,
  updateRawIngredient,
  deleteRawIngredient,
  createSemiProcessedItem,
  getAllSemiProcessedItems,
  updateSemiProcessedItem,
  deleteSemiProcessedItem,
  createSemiProcessedRecipe,
  getAllSemiProcessedRecipes,
  getSemiProcessedRecipe,
  updateSemiProcessedRecipe,
  deleteSemiProcessedRecipe,
  createSkuItem,
  getAllSkuItems,
  getSkuItem,
  updateSkuItem,
  deleteSkuItem,
  createSkuRecipe,
  getAllSkuRecipes,
  getSkuRecipe,
  updateSkuRecipe,
  deleteSkuRecipe,
  createPurchasedGood,
  getAllPurchasedGoods,
  getPurchasedGood,
  updatePurchasedGood,
  deletePurchasedGood,
  replenishPurchasedGood,
  sendToCounter,
  getExpiringBatchesAlert,
  cleanupExpiredBatches
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Raw Ingredients - Admin only for all operations
router.post('/raw-ingredients', authenticate, requireAdmin, createRawIngredient);
router.get('/raw-ingredients', authenticate, getAllRawIngredients); // All authenticated users can view
router.put('/raw-ingredients/:id', authenticate, requireAdmin, updateRawIngredient);
router.delete('/raw-ingredients/:id', authenticate, requireAdmin, deleteRawIngredient);

// Semi-Processed Items - Admin only for modifications, all can view
router.post('/semi-processed-items', authenticate, requireAdmin, createSemiProcessedItem);
router.get('/semi-processed-items', authenticate, getAllSemiProcessedItems); // All authenticated users can view
router.put('/semi-processed-items/:id', authenticate, requireAdmin, updateSemiProcessedItem);
router.delete('/semi-processed-items/:id', authenticate, requireAdmin, deleteSemiProcessedItem);

// Semi-Processed Recipes - Admin only for modifications, kitchen can view
router.post('/semi-processed-recipes', authenticate, requireAdmin, createSemiProcessedRecipe);
router.get('/semi-processed-recipes', authenticate, getAllSemiProcessedRecipes); // Kitchen needs to see recipes
router.get('/semi-processed-recipes/:id', authenticate, getSemiProcessedRecipe); // Kitchen needs to see recipe details
router.put('/semi-processed-recipes/:id', authenticate, requireAdmin, updateSemiProcessedRecipe);
router.delete('/semi-processed-recipes/:id', authenticate, requireAdmin, deleteSemiProcessedRecipe);

// SKU Items - Admin only for modifications, all can view
router.post('/sku-items', authenticate, requireAdmin, createSkuItem);
router.get('/sku-items', authenticate, getAllSkuItems); // Kitchen and Stall need to see SKU items
router.get('/sku-items/:id', authenticate, getSkuItem);
router.put('/sku-items/:id', authenticate, requireAdmin, updateSkuItem);
router.delete('/sku-items/:id', authenticate, requireAdmin, deleteSkuItem);

// SKU Recipes - Admin only for modifications, kitchen can view
router.post('/sku-recipes', authenticate, requireAdmin, createSkuRecipe);
router.get('/sku-recipes', authenticate, getAllSkuRecipes); // Kitchen needs to see recipes
router.get('/sku-recipes/by-sku/:skuId', authenticate, getSkuRecipe);
router.put('/sku-recipes/by-sku/:skuId', authenticate, requireAdmin, updateSkuRecipe);
router.delete('/sku-recipes/by-sku/:skuId', authenticate, requireAdmin, deleteSkuRecipe);

// Purchased Goods - Admin only for modifications, all can view
router.post('/purchased-goods', authenticate, requireAdmin, createPurchasedGood);
router.get('/purchased-goods', authenticate, getAllPurchasedGoods); // All authenticated users can view
router.get('/purchased-goods/:id', authenticate, getPurchasedGood);
router.put('/purchased-goods/:id', authenticate, requireAdmin, updatePurchasedGood);
router.delete('/purchased-goods/:id', authenticate, requireAdmin, deletePurchasedGood);

// Purchased Goods - Stock Management
router.post('/purchased-goods/:id/replenish', authenticate, requireAdmin, replenishPurchasedGood);
router.post('/purchased-goods/:id/send-to-counter', authenticate, requireAdmin, sendToCounter);

// Expiry Alerts - All authenticated users can view
router.get('/expiry/batches', authenticate, getExpiringBatchesAlert); // Query param: ?hours=4
router.post('/expiry/cleanup', authenticate, requireAdmin, cleanupExpiredBatches); // Admin only

export default router;
