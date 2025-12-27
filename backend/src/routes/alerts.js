import express from 'express';
import {
  getAlerts,
  getLowStock,
  getLowRaw
} from '../controllers/alertController.js';

const router = express.Router();

router.get('/', getAlerts);
router.get('/low-stock', getLowStock);
router.get('/low-raw', getLowRaw);

export default router;
