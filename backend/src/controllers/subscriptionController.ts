import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, ApiResponse } from '../types';

const prisma = new PrismaClient();

/**
 * Follow a user
 * POST /api/subscriptions
 */
export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      } as ApiResponse);
    }

    // Can't follow yourself
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot follow yourself',
      } as ApiResponse);
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      } as ApiResponse);
    }

    // Check if already following
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        error: 'Already following this user',
      } as ApiResponse);
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        followerId: req.user.id,
        followingId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: subscription,
    } as ApiResponse);
  } catch (error) {
    console.error('Error following user:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to follow user',
    } as ApiResponse);
  }
};

/**
 * Unfollow a user
 * DELETE /api/subscriptions/:userId
 */
export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    const { userId } = req.params;

    // Find and delete subscription
    const subscription = await prisma.subscription.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Not following this user',
      } as ApiResponse);
    }

    await prisma.subscription.delete({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    });

    return res.json({
      success: true,
      message: 'Successfully unfollowed user',
    } as ApiResponse);
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to unfollow user',
    } as ApiResponse);
  }
};

/**
 * Get list of users the current user is following
 * GET /api/subscriptions/following
 */
export const getFollowing = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        followerId: req.user.id,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const followingUsers = subscriptions.map((sub) => ({
      ...sub.following,
      followedAt: sub.createdAt,
    }));

    return res.json({
      success: true,
      data: followingUsers,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching following list:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch following list',
    } as ApiResponse);
  }
};

/**
 * Get list of users following the current user
 * GET /api/subscriptions/followers
 */
export const getFollowers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        followingId: req.user.id,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const followers = subscriptions.map((sub) => ({
      ...sub.follower,
      followedAt: sub.createdAt,
    }));

    return res.json({
      success: true,
      data: followers,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching followers list:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch followers list',
    } as ApiResponse);
  }
};

/**
 * Get suggested users to follow (users who have commented on your documents)
 * GET /api/subscriptions/suggestions
 */
export const getSuggestedUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    // Get texts the user has opened
    const userDocs = await prisma.userDocument.findMany({
      where: {
        userId: req.user.id,
      },
      select: {
        textId: true,
      },
    });

    const textIds = userDocs.map((doc) => doc.textId);

    // Get users who have commented on these texts
    const comments = await prisma.comment.findMany({
      where: {
        textId: { in: textIds },
        userId: { not: req.user.id }, // Exclude self
        isPublic: true,
      },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      distinct: ['userId'],
    });

    // Get current following list
    const following = await prisma.subscription.findMany({
      where: {
        followerId: req.user.id,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((sub) => sub.followingId);

    // Filter out users already following
    const suggestions = comments
      .map((comment) => comment.user)
      .filter((user) => !followingIds.includes(user.id));

    // Deduplicate
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map((user) => [user.id, user])).values()
    );

    return res.json({
      success: true,
      data: uniqueSuggestions,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch suggested users',
    } as ApiResponse);
  }
};

/**
 * Check if current user is following specific user(s)
 * GET /api/subscriptions/check?userIds=id1,id2,id3
 */
export const checkFollowing = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    const { userIds } = req.query;

    if (!userIds || typeof userIds !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userIds query parameter is required',
      } as ApiResponse);
    }

    const userIdArray = userIds.split(',');

    const subscriptions = await prisma.subscription.findMany({
      where: {
        followerId: req.user.id,
        followingId: { in: userIdArray },
      },
      select: {
        followingId: true,
      },
    });

    const followingMap = subscriptions.reduce((acc, sub) => {
      acc[sub.followingId] = true;
      return acc;
    }, {} as Record<string, boolean>);

    return res.json({
      success: true,
      data: followingMap,
    } as ApiResponse);
  } catch (error) {
    console.error('Error checking following status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check following status',
    } as ApiResponse);
  }
};
