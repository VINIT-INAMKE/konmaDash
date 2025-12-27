import express from 'express';
import {
  getAlerts,
  getLowStock,
  getLowRaw
} from '../controllers/alertController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all alert routes - require authentication (all roles can access)
router.use(authenticate);

router.get('/', getAlerts);
router.get('/low-stock', getLowStock);
router.get('/low-raw', getLowRaw);

export default router;
