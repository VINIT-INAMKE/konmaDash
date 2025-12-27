import mongoose from 'mongoose';

const transferLogSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['completed'],  // Only 'completed' - no pending states
    default: 'completed'
  },
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
  semiProcessedUsed: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SemiProcessedItem'
    },
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  }],
  sentAt: {
    type: Date,
    default: Date.now
  },
  sentBy: {
    type: String,
    default: 'Kitchen Staff'
  },
  receivedAt: {
    type: Date
  },
  receivedBy: {
    type: String
  }
}, {
  timestamps: true
});

const TransferLog = mongoose.model('TransferLog', transferLogSchema);

export default TransferLog;
