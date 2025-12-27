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
import { authenticate, requireStall } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all stall routes - require authentication and stall or admin role
router.use(authenticate, requireStall);

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
