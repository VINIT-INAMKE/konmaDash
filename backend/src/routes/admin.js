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
  deleteSkuRecipe
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

export default router;
