import { Router } from 'express';
import {
  createComment,
  getComments,
  getCommentFeed,
  deleteComment,
} from '../controllers/commentController';
import { mockAuthMiddleware } from '../middleware/auth';

const router = Router();

// All comment routes require authentication
router.use(mockAuthMiddleware);

// Create a new comment
router.post('/', createComment);

// Get comments for a specific text
router.get('/', getComments);

// Get comment feed from followed users
router.get('/feed', getCommentFeed);

// Delete a comment
router.delete('/:id', deleteComment);

export default router;
