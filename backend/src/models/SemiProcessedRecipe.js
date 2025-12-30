import mongoose from 'mongoose';

const semiProcessedRecipeSchema = new mongoose.Schema({
  outputName: {
    type: String,
    required: true,
    unique: true
  },
  outputQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  outputUnit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'ml', 'L', 'nos', 'pieces']
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
  instructions: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    required: true,
    default: 1,
    min: 1
    // 1 = Made from raw ingredients only
    // 2 = Made from level 1 semi-processed + raw
    // 3 = Made from level 2 semi-processed + raw, etc.
    // Automatically calculated to prevent circular dependencies
  },
  holdingTimeHours: {
    type: Number,
    required: true,
    default: 24
    // e.g., 24 for most items, 48 for gravies, 168 (7 days) for frozen ganache
  },
  storageTemp: {
    type: String,
    required: true,
    enum: ['chiller_2_4', 'freezer_minus_18', 'warm_30_32', 'room_temp'],
    default: 'chiller_2_4'
    // chiller_2_4: 2-4°C (most items)
    // freezer_minus_18: -18°C (ganache)
    // warm_30_32: 30-32°C (melted chocolate)
    // room_temp: Room temperature
  }
}, {
  timestamps: true
});

const SemiProcessedRecipe = mongoose.model('SemiProcessedRecipe', semiProcessedRecipeSchema);

export default SemiProcessedRecipe;
