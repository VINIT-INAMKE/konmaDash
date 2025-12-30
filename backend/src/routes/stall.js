import express from 'express';
import {
  getPendingTransfers,
  getTransferHistory,
  receiveTransfer,
  getStallInventory,
  createSale,
  createCartSale,
  createTransaction,
  getSales,
  getCartSales,
  getTransactions,
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

// Unified Transactions (NEW - single source of truth)
router.post('/transaction', createTransaction);
router.get('/transactions', getTransactions);

// Legacy Sales endpoints (for backward compatibility)
router.post('/sale', createSale);
router.post('/cart-sale', createCartSale);
router.get('/sales', getSales);
router.get('/cart-sales', getCartSales);
router.get('/sales-summary', getSalesSummary);

export default router;
