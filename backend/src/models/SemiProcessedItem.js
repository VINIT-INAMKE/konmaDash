import mongoose from 'mongoose';

const semiProcessedItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['batch', 'fixed'],
    // 'batch' = cooked items like Butter Chicken gravy
    // 'fixed' = frozen/pre-made items like Danish pastry, cheese
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'ml', 'L', 'nos', 'pieces']
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  batches: [{
    batchId: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
      // Calculated from createdAt + recipe.holdingTimeHours
      // Used for food safety compliance - expired batches cannot be used
    }
  }],
  imageUrl: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const SemiProcessedItem = mongoose.model('SemiProcessedItem', semiProcessedItemSchema);

export default SemiProcessedItem;
