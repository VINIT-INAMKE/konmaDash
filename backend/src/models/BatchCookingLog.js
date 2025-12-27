import mongoose from 'mongoose';

const batchCookingLogSchema = new mongoose.Schema({
  semiProcessedRecipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SemiProcessedRecipe',
    required: true
  },
  outputName: {
    type: String,
    required: true
  },
  quantityProduced: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  rawIngredientsUsed: [{
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawIngredient'
    },
    ingredientName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  }],
  createdBy: {
    type: String,
    default: 'Kitchen Staff'
  }
}, {
  timestamps: true
});

const BatchCookingLog = mongoose.model('BatchCookingLog', batchCookingLogSchema);

export default BatchCookingLog;
