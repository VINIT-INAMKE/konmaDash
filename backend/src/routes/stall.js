import express from 'express';
import {
  getPendingTransfers,
  getTransferHistory,
  receiveTransfer,
  getStallInventory,
  createSale,
  getSales,
  getSalesSummary
} from '../controllers/stallController.js';

const router = express.Router();

// Transfers (view only - counter stock auto-updated by kitchen)
router.get('/pending-transfers', getPendingTransfers);  // Deprecated - returns empty
router.get('/transfer-history', getTransferHistory);  // View completed transfers
router.post('/receive-transfer/:id', receiveTransfer);  // Deprecated

// Inventory
router.get('/inventory', getStallInventory);

// Sales
router.post('/sale', createSale);
router.get('/sales', getSales);
router.get('/sales-summary', getSalesSummary);

export default router;
