import express from 'express';
import { printReceipt, printCartReceipt } from '../controllers/printController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Print receipt - requires authentication (stall users)
router.post('/receipt', authenticate, printReceipt);
router.post('/cart-receipt', authenticate, printCartReceipt);

export default router;
