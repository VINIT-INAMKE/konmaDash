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
  }
}, {
  timestamps: true
});

const SkuItem = mongoose.model('SkuItem', skuItemSchema);

export default SkuItem;
