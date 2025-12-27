import express from 'express';
import {
  createRawIngredient,
  getAllRawIngredients,
  updateRawIngredient,
  deleteRawIngredient,
  createSemiProcessedItem,
  getAllSemiProcessedItems,
  updateSemiProcessedItem,
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

const router = express.Router();

// Raw Ingredients
router.post('/raw-ingredients', createRawIngredient);
router.get('/raw-ingredients', getAllRawIngredients);
router.put('/raw-ingredients/:id', updateRawIngredient);
router.delete('/raw-ingredients/:id', deleteRawIngredient);

// Semi-Processed Items
router.post('/semi-processed-items', createSemiProcessedItem);
router.get('/semi-processed-items', getAllSemiProcessedItems);
router.put('/semi-processed-items/:id', updateSemiProcessedItem);

// Semi-Processed Recipes (Raw → Semi)
router.post('/semi-processed-recipes', createSemiProcessedRecipe);
router.get('/semi-processed-recipes', getAllSemiProcessedRecipes);
router.get('/semi-processed-recipes/:id', getSemiProcessedRecipe);
router.put('/semi-processed-recipes/:id', updateSemiProcessedRecipe);
router.delete('/semi-processed-recipes/:id', deleteSemiProcessedRecipe);

// SKU Items
router.post('/sku-items', createSkuItem);
router.get('/sku-items', getAllSkuItems);
router.get('/sku-items/:id', getSkuItem);
router.put('/sku-items/:id', updateSkuItem);
router.delete('/sku-items/:id', deleteSkuItem);

// SKU Recipes (Semi → SKU)
router.post('/sku-recipes', createSkuRecipe);
router.get('/sku-recipes', getAllSkuRecipes);
router.get('/sku-recipes/by-sku/:skuId', getSkuRecipe);
router.put('/sku-recipes/by-sku/:skuId', updateSkuRecipe);
router.delete('/sku-recipes/by-sku/:skuId', deleteSkuRecipe);

export default router;
