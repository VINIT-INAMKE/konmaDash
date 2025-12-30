import RawIngredient from '../models/RawIngredient.js';
import SemiProcessedItem from '../models/SemiProcessedItem.js';
import SemiProcessedRecipe from '../models/SemiProcessedRecipe.js';
import SkuItem from '../models/SkuItem.js';
import SkuRecipe from '../models/SkuRecipe.js';
import PurchasedGood from '../models/PurchasedGood.js';
import { logActivity } from '../services/logService.js';
import { getExpiringBatches, removeExpiredBatches } from '../services/inventoryService.js';

// Raw Ingredients
export const createRawIngredient = async (req, res) => {
  try {
    const ingredient = new RawIngredient(req.body);
    await ingredient.save();

    // Log activity
    await logActivity(
      'RAW_INGREDIENT_ADDED',
      'RAW_INGREDIENT',
      `Added raw ingredient: ${ingredient.name}`,
      {
        ingredientId: ingredient._id,
        name: ingredient.name,
        unit: ingredient.unit,
        currentStock: ingredient.currentStock,
        reorderLevel: ingredient.reorderLevel
      },
      req.user.username
    );

    res.status(201).json({ success: true, data: ingredient });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllRawIngredients = async (req, res) => {
  try {
    const ingredients = await RawIngredient.find().sort({ name: 1 });
    res.json({ success: true, data: ingredients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateRawIngredient = async (req, res) => {
  try {
    const ingredient = await RawIngredient.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!ingredient) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }
    res.json({ success: true, data: ingredient });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteRawIngredient = async (req, res) => {
  try {
    const ingredient = await RawIngredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }

    // Log activity
    await logActivity(
      'RAW_INGREDIENT_DELETED',
      'RAW_INGREDIENT',
      `Deleted raw ingredient: ${ingredient.name}`,
      {
        ingredientId: ingredient._id,
        name: ingredient.name,
        unit: ingredient.unit,
        previousStock: ingredient.currentStock
      },
      req.user.username
    );

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Semi-Processed Items
export const createSemiProcessedItem = async (req, res) => {
  try {
    const item = new SemiProcessedItem(req.body);
    await item.save();

    // Log activity
    await logActivity(
      'SEMI_PROCESSED_ADDED',
      'SEMI_PROCESSED',
      `Added semi-processed item: ${item.name}`,
      {
        itemId: item._id,
        name: item.name,
        type: item.type,
        unit: item.unit,
        currentStock: item.currentStock
      },
      req.user.username
    );

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllSemiProcessedItems = async (req, res) => {
  try {
    const items = await SemiProcessedItem.find().sort({ name: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSemiProcessedItem = async (req, res) => {
  try {
    const item = await SemiProcessedItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteSemiProcessedItem = async (req, res) => {
  try {
    const item = await SemiProcessedItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Log activity
    await logActivity(
      'SEMI_PROCESSED_DELETED',
      'SEMI_PROCESSED',
      `Deleted semi-processed item: ${item.name}`,
      {
        itemId: item._id,
        name: item.name,
        type: item.type,
        unit: item.unit,
        previousStock: item.currentStock
      },
      req.user.username
    );

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Semi-Processed Recipes
export const createSemiProcessedRecipe = async (req, res) => {
  try {
    const recipe = new SemiProcessedRecipe(req.body);
    await recipe.save();

    // Create corresponding SemiProcessedItem if it doesn't exist
    // This allows Level 2 recipes to reference Level 1 items before they're cooked
    const existingItem = await SemiProcessedItem.findOne({ name: recipe.outputName });
    if (!existingItem) {
      const item = new SemiProcessedItem({
        name: recipe.outputName,
        type: 'batch', // Items from recipes are batch type
        unit: recipe.outputUnit,
        currentStock: 0,
        batches: []
      });
      await item.save();
    }

    // Log activity
    await logActivity(
      'SEMI_RECIPE_ADDED',
      'RECIPE',
      `Added semi-processed recipe: ${recipe.outputName}`,
      {
        recipeId: recipe._id,
        outputName: recipe.outputName,
        outputQuantity: recipe.outputQuantity,
        outputUnit: recipe.outputUnit,
        ingredientsCount: recipe.ingredients.length
      },
      req.user.username
    );

    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllSemiProcessedRecipes = async (req, res) => {
  try {
    const recipes = await SemiProcessedRecipe.find()
      .populate('ingredients.ingredientId')
      .sort({ outputName: 1 });
    res.json({ success: true, data: recipes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSemiProcessedRecipe = async (req, res) => {
  try {
    const recipe = await SemiProcessedRecipe.findById(req.params.id)
      .populate('ingredients.ingredientId');
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSemiProcessedRecipe = async (req, res) => {
  try {
    const recipe = await SemiProcessedRecipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }

    // If outputName was updated, create corresponding SemiProcessedItem if it doesn't exist
    if (req.body.outputName) {
      const existingItem = await SemiProcessedItem.findOne({ name: req.body.outputName });
      if (!existingItem) {
        const item = new SemiProcessedItem({
          name: req.body.outputName,
          type: 'batch',
          unit: req.body.outputUnit || recipe.outputUnit,
          currentStock: 0,
          batches: []
        });
        await item.save();
      }
    }

    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteSemiProcessedRecipe = async (req, res) => {
  try {
    const recipe = await SemiProcessedRecipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }

    // Log activity
    await logActivity(
      'SEMI_RECIPE_DELETED',
      'RECIPE',
      `Deleted semi-processed recipe: ${recipe.outputName}`,
      {
        recipeId: recipe._id,
        outputName: recipe.outputName,
        outputQuantity: recipe.outputQuantity,
        outputUnit: recipe.outputUnit,
        ingredientsCount: recipe.ingredients.length
      },
      req.user.username
    );

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// SKU Items
export const createSkuItem = async (req, res) => {
  try {
    const sku = new SkuItem(req.body);
    await sku.save();

    // Log activity
    await logActivity(
      'SKU_ADDED',
      'SKU',
      `Added SKU item: ${sku.name}`,
      {
        skuId: sku._id,
        name: sku.name,
        price: sku.price,
        targetSkus: sku.targetSkus,
        lowStockThreshold: sku.lowStockThreshold
      },
      req.user.username
    );

    res.status(201).json({ success: true, data: sku });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllSkuItems = async (req, res) => {
  try {
    const skus = await SkuItem.find().sort({ name: 1 });
    res.json({ success: true, data: skus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSkuItem = async (req, res) => {
  try {
    const sku = await SkuItem.findById(req.params.id);
    if (!sku) {
      return res.status(404).json({ success: false, error: 'SKU not found' });
    }
    res.json({ success: true, data: sku });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSkuItem = async (req, res) => {
  try {
    const sku = await SkuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!sku) {
      return res.status(404).json({ success: false, error: 'SKU not found' });
    }
    res.json({ success: true, data: sku });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteSkuItem = async (req, res) => {
  try {
    const sku = await SkuItem.findByIdAndDelete(req.params.id);
    if (!sku) {
      return res.status(404).json({ success: false, error: 'SKU not found' });
    }

    // Log activity
    await logActivity(
      'SKU_DELETED',
      'SKU',
      `Deleted SKU item: ${sku.name}`,
      {
        skuId: sku._id,
        name: sku.name,
        price: sku.price,
        previousStock: sku.currentStallStock,
        targetSkus: sku.targetSkus
      },
      req.user.username
    );

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// SKU Recipes
export const createSkuRecipe = async (req, res) => {
  try {
    const recipe = new SkuRecipe(req.body);
    await recipe.save();

    // Log activity
    await logActivity(
      'SKU_RECIPE_ADDED',
      'RECIPE',
      `Added SKU recipe for: ${recipe.skuName}`,
      {
        recipeId: recipe._id,
        skuId: recipe.skuId,
        skuName: recipe.skuName,
        ingredientsCount: recipe.ingredients.length
      },
      req.user.username
    );

    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllSkuRecipes = async (req, res) => {
  try {
    const recipes = await SkuRecipe.find()
      .populate('skuId')
      .populate('ingredients.ingredientId');
    res.json({ success: true, data: recipes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSkuRecipe = async (req, res) => {
  try {
    const recipe = await SkuRecipe.findOne({ skuId: req.params.skuId })
      .populate('skuId')
      .populate('ingredients.ingredientId');
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'SKU recipe not found' });
    }
    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSkuRecipe = async (req, res) => {
  try {
    const recipe = await SkuRecipe.findOneAndUpdate(
      { skuId: req.params.skuId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'SKU recipe not found' });
    }
    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteSkuRecipe = async (req, res) => {
  try {
    const recipe = await SkuRecipe.findOneAndDelete({ skuId: req.params.skuId });
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'SKU recipe not found' });
    }

    // Log activity
    await logActivity(
      'SKU_RECIPE_DELETED',
      'RECIPE',
      `Deleted SKU recipe for: ${recipe.skuName}`,
      {
        recipeId: recipe._id,
        skuId: recipe.skuId,
        skuName: recipe.skuName,
        ingredientsCount: recipe.ingredients.length
      },
      req.user.username
    );

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Purchased Goods
export const createPurchasedGood = async (req, res) => {
  try {
    const good = new PurchasedGood(req.body);
    await good.save();

    // Log activity
    await logActivity(
      'PURCHASED_GOOD_ADDED',
      'PURCHASED_GOOD',
      `Added purchased good: ${good.name}`,
      {
        goodId: good._id,
        name: good.name,
        category: good.category,
        unit: good.unit,
        currentStock: good.currentStock,
        counterStock: good.counterStock,
        supplier: good.supplier
      },
      req.user.username
    );

    res.status(201).json({ success: true, data: good });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllPurchasedGoods = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const goods = await PurchasedGood.find(filter).sort({ name: 1 });
    res.json({ success: true, data: goods });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPurchasedGood = async (req, res) => {
  try {
    const good = await PurchasedGood.findById(req.params.id);
    if (!good) {
      return res.status(404).json({ success: false, error: 'Purchased good not found' });
    }
    res.json({ success: true, data: good });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePurchasedGood = async (req, res) => {
  try {
    const good = await PurchasedGood.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!good) {
      return res.status(404).json({ success: false, error: 'Purchased good not found' });
    }
    res.json({ success: true, data: good });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deletePurchasedGood = async (req, res) => {
  try {
    const good = await PurchasedGood.findByIdAndDelete(req.params.id);
    if (!good) {
      return res.status(404).json({ success: false, error: 'Purchased good not found' });
    }

    // Log activity
    await logActivity(
      'PURCHASED_GOOD_DELETED',
      'PURCHASED_GOOD',
      `Deleted purchased good: ${good.name}`,
      {
        goodId: good._id,
        name: good.name,
        category: good.category,
        previousStock: good.currentStock,
        previousCounterStock: good.counterStock
      },
      req.user.username
    );

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Purchased Goods - Stock Management
export const replenishPurchasedGood = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid quantity' });
    }

    const good = await PurchasedGood.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { currentStock: quantity },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!good) {
      return res.status(404).json({ success: false, error: 'Purchased good not found' });
    }

    // Log activity
    await logActivity(
      'STOCK_REPLENISHED',
      'PURCHASED_GOOD',
      `Replenished ${quantity}${good.unit} of ${good.name}`,
      {
        goodId: good._id,
        name: good.name,
        quantityAdded: quantity,
        unit: good.unit,
        newStock: good.currentStock
      },
      req.user.username
    );

    res.json({ success: true, data: good });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const sendToCounter = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid quantity' });
    }

    const good = await PurchasedGood.findById(req.params.id);
    if (!good) {
      return res.status(404).json({ success: false, error: 'Purchased good not found' });
    }

    if (good.currentStock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock: need ${quantity}${good.unit}, have ${good.currentStock}${good.unit}`
      });
    }

    // Move from currentStock to counterStock
    good.currentStock -= quantity;
    good.counterStock += quantity;
    good.updatedAt = new Date();
    await good.save();

    // Log activity
    await logActivity(
      'SENT_TO_COUNTER',
      'PURCHASED_GOOD',
      `Sent ${quantity}${good.unit} of ${good.name} to counter`,
      {
        goodId: good._id,
        name: good.name,
        quantity,
        unit: good.unit,
        newMainStock: good.currentStock,
        newCounterStock: good.counterStock
      },
      req.user.username
    );

    res.json({ success: true, data: good });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Expiry Alert Endpoints
export const getExpiringBatchesAlert = async (req, res) => {
  try {
    const { hours } = req.query;
    const hoursUntilExpiry = hours ? parseInt(hours) : 4; // Default 4 hours

    const expiringBatches = await getExpiringBatches(hoursUntilExpiry);

    res.json({
      success: true,
      data: {
        hoursUntilExpiry,
        count: expiringBatches.length,
        batches: expiringBatches
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const cleanupExpiredBatches = async (req, res) => {
  try {
    const removedBatches = await removeExpiredBatches();

    res.json({
      success: true,
      data: {
        count: removedBatches.length,
        batches: removedBatches
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
