import mongoose from 'mongoose';

// Schema for individual items within a transaction
const transactionItemSchema = new mongoose.Schema({
  skuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkuItem',
    required: true
  },
  skuName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  itemTotal: {
    type: Number,
    required: true,
    min: 0
  }
});

// Main transaction schema - handles both single and multi-item sales
const transactionSchema = new mongoose.Schema({
  // Transaction identification
  transactionId: {
    type: String,
    unique: true
  },
  
  // Items in this transaction (array supports both single and multi-item)
  items: [transactionItemSchema],
  
  // Transaction totals
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  itemCount: {
    type: Number,
    min: 1
  },
  
  // Staff and customer information
  soldBy: {
    type: String,
    default: 'Stall Staff'
  },
  customerName: {
    type: String,
    default: ''
  },
  customerPhone: {
    type: String,
    default: ''
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'other'],
    default: 'cash'
  },
  paymentTransactionId: {
    type: String,
    default: ''
  },
  
  // Transaction type for analytics
  transactionType: {
    type: String,
    enum: ['single_item', 'cart'],
    required: true
  }
}, {
  timestamps: true
});

// Auto-generate transaction ID before saving
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = this._id.toString();
  }
  
  // Calculate totals
  this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + item.itemTotal, 0);
  
  next();
});

// Indexes for performance
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ soldBy: 1 });
transactionSchema.index({ transactionType: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;