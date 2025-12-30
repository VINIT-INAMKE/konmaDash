import mongoose from 'mongoose';

const purchasedGoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['frozen_pastry', 'dairy', 'condiment', 'topping', 'other']
    // frozen_pastry: Bridor croissants, Miana items, frozen cruffins, plain danish
    // dairy: Cheese, cream cheese, milk
    // condiment: Blueberry purée, sauces
    // topping: Cheese shreds, toppings
    // other: Miscellaneous purchased items
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
  counterStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
    // Track separate stock at counter for assembly
  },
  reorderLevel: {
    type: Number,
    required: true,
    default: 0
  },
  supplier: {
    type: String,
    default: ''
    // e.g., "Bridor", "Miana", "Fortune Foods", "Arla"
  },
  requiresPrep: {
    type: Boolean,
    default: false
    // true for items that need reheating/preparation
    // false for ready-to-use items
  },
  prepInstructions: {
    type: String,
    default: ''
    // e.g., "Reheat at 180°C for 12 minutes", "Thaw before use"
  },
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

// Index for efficient queries
purchasedGoodSchema.index({ category: 1 });
purchasedGoodSchema.index({ name: 1 });

const PurchasedGood = mongoose.model('PurchasedGood', purchasedGoodSchema);

export default PurchasedGood;
