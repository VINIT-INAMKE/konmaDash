import { receiveAtStall, recordSale, recordTransaction } from '../services/inventoryService.js';
import SkuItem from '../models/SkuItem.js';
import TransferLog from '../models/TransferLog.js';
import Transaction from '../models/Transaction.js';

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

// Unified transaction creation (handles both single and multi-item sales)
export const createTransaction = async (req, res) => {
  try {
    const { items, customerName, customerPhone, paymentMethod, paymentTransactionId } = req.body;
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Transaction must contain at least one item'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.skuId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Each item must have a valid skuId and positive quantity'
        });
      }
    }

    const result = await recordTransaction(
      items,
      req.user.username,
      customerName,
      customerPhone,
      paymentMethod,
      paymentTransactionId
    );
    
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Legacy endpoint for backward compatibility
export const createCartSale = async (req, res) => {
  // Transform legacy request format to unified format
  const { cartItems, transactionId, ...rest } = req.body;
  const unifiedRequest = {
    ...req,
    body: {
      items: cartItems,
      paymentTransactionId: transactionId,
      ...rest
    }
  };
  
  // Use unified transaction system
  return createTransaction(unifiedRequest, res);
};

// Legacy endpoint - redirects to unified transactions
export const getSales = async (req, res) => {
  // For backward compatibility, redirect to transactions
  return getTransactions(req, res);
};

// Unified transactions endpoint (replaces both getSales and getCartSales)
export const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Legacy endpoint for backward compatibility
export const getCartSales = async (req, res) => {
  // Redirect to unified transactions
  return getTransactions(req, res);
};

export const getSalesSummary = async (req, res) => {
  try {
    // Use unified Transaction model instead of SalesLog
    const summary = await Transaction.aggregate([
      // Unwind items array to get individual item data
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.skuId',
          skuName: { $first: '$items.skuName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.itemTotal' },
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
