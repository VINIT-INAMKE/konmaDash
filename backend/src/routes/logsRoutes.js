import express from 'express';
import { getLogs } from '../controllers/logsController.js';

const router = express.Router();

// GET /api/logs - Get activity logs with optional filters
router.get('/', getLogs);

export default router;
