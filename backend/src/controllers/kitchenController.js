import { cookBatch, sendToStall, checkSemiProcessedAvailability } from '../services/inventoryService.js';
import SemiProcessedItem from '../models/SemiProcessedItem.js';
import TransferLog from '../models/TransferLog.js';
import BatchCookingLog from '../models/BatchCookingLog.js';

// Batch cooking
export const createBatch = async (req, res) => {
  try {
    const { recipeId, multiplier } = req.body;
    const result = await cookBatch(recipeId, multiplier, req.user.username);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getBatchLogs = async (req, res) => {
  try {
    const logs = await BatchCookingLog.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Semi-processed inventory
export const getSemiProcessedInventory = async (req, res) => {
  try {
    const items = await SemiProcessedItem.find().sort({ name: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Transfers
export const createTransfer = async (req, res) => {
  try {
    const { skuId, quantity } = req.body;
    const result = await sendToStall(skuId, quantity, req.user.username);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getTransfers = async (req, res) => {
  try {
    // All transfers are 'completed' status - no filtering needed
    const transfers = await TransferLog.find({ status: 'completed' })
      .populate('skuId')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: transfers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check availability
export const checkAvailability = async (req, res) => {
  try {
    const { skuId, quantity } = req.query;
    const result = await checkSemiProcessedAvailability(skuId, parseInt(quantity));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
