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
  ingredients: [{
    semiProcessedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SemiProcessedItem',
      required: true
    },
    semiProcessedName: {
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
      required: true,
      enum: ['kg', 'g', 'ml', 'L', 'nos', 'pieces']
    }
  }]
}, {
  timestamps: true
});

const SkuRecipe = mongoose.model('SkuRecipe', skuRecipeSchema);

export default SkuRecipe;
