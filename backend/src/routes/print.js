import express from 'express';
import { printReceipt } from '../controllers/printController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Print receipt - requires authentication (stall users)
router.post('/receipt', authenticate, printReceipt);

export default router;
