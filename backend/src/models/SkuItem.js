import mongoose from 'mongoose';

const skuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  targetSkus: {
    type: Number,
    required: true,
    min: 0
  },
  currentStallStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    required: true,
    default: 5
  },
  price: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['bakery', 'beverage', 'food', 'other'],
    default: 'other'
    // bakery: croissants, danish, cruffins
    // beverage: hot chocolate, coffee, tea
    // food: wraps, sandwiches
  },
  requiresAssembly: {
    type: Boolean,
    required: true,
    default: true
    // false for simple items that just need stock tracking
  },
  assemblyLocation: {
    type: String,
    required: true,
    enum: ['kitchen', 'counter', 'none'],
    default: 'kitchen'
    // kitchen: complex items assembled in prep kitchen
    // counter: simple items assembled at service counter
    // none: pre-assembled items (e.g., plain croissants)
  }
}, {
  timestamps: true
});

const SkuItem = mongoose.model('SkuItem', skuItemSchema);

export default SkuItem;
