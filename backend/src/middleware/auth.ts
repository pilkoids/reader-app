import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

/**
 * Mock authentication middleware for MVP
 * Extracts user ID from header and attaches user to request
 *
 * In production (Phase 3+), this will be replaced with OAuth/JWT
 */
export const mockAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user ID from custom header
    const userId = req.headers['x-mock-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No user ID provided. Please login.'
      });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // Attach user to request (convert null to undefined)
    req.user = {
      ...user,
      displayName: user.displayName || undefined,
      avatarUrl: user.avatarUrl || undefined
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if header is present, but doesn't fail if missing
 */
export const optionalMockAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.headers['x-mock-user-id'] as string;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true
        }
      });

      if (user) {
        req.user = {
          ...user,
          displayName: user.displayName || undefined,
          avatarUrl: user.avatarUrl || undefined
        };
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};
