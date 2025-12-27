import express from 'express';
import { login, verify, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.post('/verify', authenticate, verify);
router.post('/logout', authenticate, logout);

export default router;
