import express from 'express';
import {
  createBatch,
  getBatchLogs,
  getSemiProcessedInventory,
  createTransfer,
  getTransfers,
  checkAvailability
} from '../controllers/kitchenController.js';

const router = express.Router();

// Batch cooking
router.post('/batch-cook', createBatch);
router.get('/batch-logs', getBatchLogs);

// Semi-processed inventory
router.get('/semi-processed', getSemiProcessedInventory);

// Transfers
router.post('/transfer', createTransfer);
router.get('/transfers', getTransfers);

// Check availability
router.get('/check-availability', checkAvailability);

export default router;
