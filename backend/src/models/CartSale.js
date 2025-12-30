import mongoose from 'mongoose';

// DEPRECATED: Use Transaction model instead
// This model is kept for legacy compatibility only
const cartSaleItemSchema = new mongoose.Schema({
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
  price: {
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

const cartSaleSchema = new mongoose.Schema({
  items: {
    type: [cartSaleItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Cart must contain at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
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
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'other'],
    default: 'cash'
  },
  transactionId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Auto-generate transactionId if not provided
cartSaleSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = this._id.toString();
  }
  next();
});

// Calculate totalAmount from items
cartSaleSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.itemTotal, 0);
  next();
});

const CartSale = mongoose.model('CartSale', cartSaleSchema);

export default CartSale;