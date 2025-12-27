import { receiveAtStall, recordSale } from '../services/inventoryService.js';
import SkuItem from '../models/SkuItem.js';
import TransferLog from '../models/TransferLog.js';
import SalesLog from '../models/SalesLog.js';

// Transfers - View only (no action needed, counter stock auto-updated by kitchen)
export const getPendingTransfers = async (req, res) => {
  try {
    // Return empty array - no pending transfers in the correct flow
    // Kitchen updates counter stock immediately
    res.json({ success: true, data: [], message: 'Counter stock is updated automatically when kitchen sends SKUs' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTransferHistory = async (req, res) => {
  try {
    const transfers = await TransferLog.find({ status: 'completed' })
      .populate('skuId')
      .sort({ sentAt: -1 })
      .limit(50);
    res.json({ success: true, data: transfers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const receiveTransfer = async (req, res) => {
  try {
    // Deprecated endpoint
    res.status(410).json({
      success: false,
      error: 'This endpoint is deprecated. Counter stock is updated automatically when kitchen sends SKUs.'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Inventory
export const getStallInventory = async (req, res) => {
  try {
    const inventory = await SkuItem.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Sales
export const createSale = async (req, res) => {
  try {
    const { skuId, quantity, customerName, customerPhone, paymentMethod, transactionId } = req.body;
    const result = await recordSale(skuId, quantity, req.user.username, customerName, customerPhone, paymentMethod, transactionId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getSales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sales = await SalesLog.find(filter)
      .populate('skuId')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSalesSummary = async (req, res) => {
  try {
    const summary = await SalesLog.aggregate([
      {
        $group: {
          _id: '$skuId',
          skuName: { $first: '$skuName' },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } }
    ]);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
