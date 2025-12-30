import mongoose from 'mongoose';

const skuRecipeSchema = new mongoose.Schema({
  skuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkuItem',
    required: true,
    unique: true
  },
  skuName: {
    type: String,
    required: true
  },
  hasRecipe: {
    type: Boolean,
    required: true,
    default: true
    // false for simple purchased items that just need stock tracking (e.g., plain croissants)
  },
  ingredients: [{
    // POLYMORPHIC REFERENCE - can be raw, semiProcessed, or purchasedGood
    ingredientType: {
      type: String,
      required: true,
      enum: ['raw', 'semiProcessed', 'purchasedGood']
    },
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'ingredients.ingredientRef'
    },
    ingredientRef: {
      type: String,
      required: true,
      enum: ['RawIngredient', 'SemiProcessedItem', 'PurchasedGood']
    },
    ingredientName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true
    }
  }],
  assemblyInstructions: {
    type: String,
    default: ''
    // e.g., "Bake croissant, cool 2 min, drizzle 20g chocolate"
  }
}, {
  timestamps: true
});

const SkuRecipe = mongoose.model('SkuRecipe', skuRecipeSchema);

export default SkuRecipe;
