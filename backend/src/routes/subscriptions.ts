import { Router } from 'express';
import {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getSuggestedUsers,
  checkFollowing,
} from '../controllers/subscriptionController';
import { mockAuthMiddleware } from '../middleware/auth';

const router = Router();

// All subscription routes require authentication
router.use(mockAuthMiddleware);

// Follow a user
router.post('/', followUser);

// Unfollow a user
router.delete('/:userId', unfollowUser);

// Get following list
router.get('/following', getFollowing);

// Get followers list
router.get('/followers', getFollowers);

// Get suggested users to follow
router.get('/suggestions', getSuggestedUsers);

// Check if following specific users
router.get('/check', checkFollowing);

export default router;
