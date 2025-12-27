import RawIngredient from '../models/RawIngredient.js';
import SemiProcessedItem from '../models/SemiProcessedItem.js';
import SemiProcessedRecipe from '../models/SemiProcessedRecipe.js';
import SkuItem from '../models/SkuItem.js';
import SkuRecipe from '../models/SkuRecipe.js';
import { logActivity } from '../services/logService.js';

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
      .populate('ingredients.rawIngredientId')
      .sort({ outputName: 1 });
    res.json({ success: true, data: recipes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSemiProcessedRecipe = async (req, res) => {
  try {
    const recipe = await SemiProcessedRecipe.findById(req.params.id)
      .populate('ingredients.rawIngredientId');
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
      .populate('ingredients.semiProcessedId');
    res.json({ success: true, data: recipes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSkuRecipe = async (req, res) => {
  try {
    const recipe = await SkuRecipe.findOne({ skuId: req.params.skuId })
      .populate('skuId')
      .populate('ingredients.semiProcessedId');
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
