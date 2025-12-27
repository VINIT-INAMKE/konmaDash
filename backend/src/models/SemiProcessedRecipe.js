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
    rawIngredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawIngredient',
      required: true
    },
    rawIngredientName: {
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
  }
}, {
  timestamps: true
});

const SemiProcessedRecipe = mongoose.model('SemiProcessedRecipe', semiProcessedRecipeSchema);

export default SemiProcessedRecipe;
