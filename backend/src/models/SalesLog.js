import mongoose from 'mongoose';

const salesLogSchema = new mongoose.Schema({
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
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
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

const SalesLog = mongoose.model('SalesLog', salesLogSchema);

export default SalesLog;
