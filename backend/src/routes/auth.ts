import { Router } from 'express';
import {
  getMockUsers,
  mockLogin,
  getCurrentUser,
  logout
} from '../controllers/authController';
import { mockAuthMiddleware } from '../middleware/auth';

const router = Router();

// Public routes (no auth required)
router.get('/mock-users', getMockUsers);
router.post('/mock-login', mockLogin);
router.post('/logout', logout);

// Protected route (requires auth)
router.get('/me', mockAuthMiddleware, getCurrentUser);

export default router;
