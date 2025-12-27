import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      // Raw Ingredients
      'RAW_INGREDIENT_ADDED',
      'RAW_INGREDIENT_UPDATED',
      'RAW_INGREDIENT_DELETED',
      'RAW_INGREDIENT_REPLENISHED',

      // Semi-Processed Items
      'SEMI_PROCESSED_ADDED',
      'SEMI_PROCESSED_UPDATED',
      'SEMI_PROCESSED_DELETED',

      // Semi-Processed Recipes
      'SEMI_RECIPE_ADDED',
      'SEMI_RECIPE_UPDATED',
      'SEMI_RECIPE_DELETED',

      // Batch Cooking
      'BATCH_COOKED',

      // SKU Items
      'SKU_ADDED',
      'SKU_UPDATED',
      'SKU_DELETED',

      // SKU Recipes
      'SKU_RECIPE_ADDED',
      'SKU_RECIPE_UPDATED',
      'SKU_RECIPE_DELETED',

      // Counter Operations
      'SENT_TO_COUNTER',

      // Sales
      'SALE_RECORDED',

      // System
      'SYSTEM_ERROR',
      'SYSTEM_WARNING'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['RAW_INGREDIENT', 'SEMI_PROCESSED', 'RECIPE', 'KITCHEN', 'SKU', 'STALL', 'SYSTEM']
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  performedBy: {
    type: String,
    default: 'System'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster querying
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ category: 1 });
activityLogSchema.index({ action: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
