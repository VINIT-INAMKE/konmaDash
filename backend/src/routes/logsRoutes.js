import express from 'express';
import { getLogs } from '../controllers/logsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all log routes - require authentication (all roles can access)
router.use(authenticate);

// GET /api/logs - Get activity logs with optional filters
router.get('/', getLogs);

export default router;
