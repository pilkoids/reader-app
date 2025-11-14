import { Router } from 'express';
import { createText, getUserTexts, getTextById } from '../controllers/textController';
import { mockAuthMiddleware } from '../middleware/auth';

const router = Router();

// Create or find a text
router.post('/', mockAuthMiddleware, createText);

// Get user's library
router.get('/', mockAuthMiddleware, getUserTexts);

// Get specific text
router.get('/:id', getTextById);

export default router;
