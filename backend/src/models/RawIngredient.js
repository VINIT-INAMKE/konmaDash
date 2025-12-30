import mongoose from 'mongoose';

const rawIngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
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
  reorderLevel: {
    type: Number,
    required: true,
    default: 0
  },
  canReplenish: {
    type: Boolean,
    required: true,
    default: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  supplier: {
    type: String,
    default: ''
    // e.g., "Maddur", "Fortune Foods", "Local Dairy"
  },
  category: {
    type: String,
    default: ''
    // e.g., "dairy", "chocolate", "spice", "vegetable", "protein"
  },
  notes: {
    type: String,
    default: ''
    // e.g., "65% dark chocolate", "Full cream milk", "Organic"
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const RawIngredient = mongoose.model('RawIngredient', rawIngredientSchema);

export default RawIngredient;
