import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, ApiResponse } from '../types';
import { fingerprintService } from '../services/fingerprintService';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating a comment
const createCommentSchema = z.object({
  textId: z.string().uuid(),
  selectedText: z.string().min(1).max(500),
  contextBefore: z.string().max(200),
  contextAfter: z.string().max(200),
  commentText: z.string().min(1),
  startOffset: z.number().int().min(0),
  endOffset: z.number().int().min(0),
  chapter: z.string().optional(),
  pageNumber: z.number().int().optional(),
  paragraphNumber: z.number().int().optional(),
  isPublic: z.boolean().optional().default(true),
});

/**
 * Create a new comment/annotation
 * POST /api/comments
 */
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    // Validate request body
    const validationResult = createCommentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        message: validationResult.error.message,
      } as ApiResponse);
    }

    const data = validationResult.data;

    // Generate fingerprint for text matching
    const fingerprint = fingerprintService.generateFingerprint(
      data.selectedText,
      data.contextBefore,
      data.contextAfter
    );

    // Calculate character offset (middle of selection)
    const characterOffset = Math.floor((data.startOffset + data.endOffset) / 2);

    // Check if text exists, create if not
    let text = await prisma.text.findUnique({
      where: { id: data.textId },
    });

    if (!text) {
      return res.status(404).json({
        success: false,
        error: 'Text not found',
      } as ApiResponse);
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        userId: req.user.id,
        textId: data.textId,
        selectedText: data.selectedText,
        contextBefore: data.contextBefore,
        contextAfter: data.contextAfter,
        fingerprint,
        commentText: data.commentText,
        characterOffset,
        chapter: data.chapter,
        pageNumber: data.pageNumber,
        paragraphNumber: data.paragraphNumber,
        isPublic: data.isPublic,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: comment,
    } as ApiResponse);
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create comment',
    } as ApiResponse);
  }
};

/**
 * Get comments for a specific text
 * GET /api/comments?textId=xxx
 */
export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { textId } = req.query;

    if (!textId || typeof textId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'textId is required',
      } as ApiResponse);
    }

    // Get all public comments for this text
    const comments = await prisma.comment.findMany({
      where: {
        textId: textId as string,
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        characterOffset: 'asc', // Order by position in document
      },
    });

    return res.json({
      success: true,
      data: comments,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch comments',
    } as ApiResponse);
  }
};

/**
 * Get comments from users that the current user follows
 * GET /api/comments/feed
 */
export const getCommentFeed = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    // Get list of users the current user follows
    const subscriptions = await prisma.subscription.findMany({
      where: {
        followerId: req.user.id,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = subscriptions.map((sub) => sub.followingId);

    // Get recent comments from followed users
    const comments = await prisma.comment.findMany({
      where: {
        userId: {
          in: followingIds,
        },
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        text: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent 50 comments
    });

    return res.json({
      success: true,
      data: comments,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching comment feed:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch comment feed',
    } as ApiResponse);
  }
};

/**
 * Delete a comment (only by the author)
 * DELETE /api/comments/:id
 */
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    const { id } = req.params;

    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      } as ApiResponse);
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only delete your own comments',
      } as ApiResponse);
    }

    await prisma.comment.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Comment deleted successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete comment',
    } as ApiResponse);
  }
};
