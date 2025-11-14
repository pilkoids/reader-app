import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, ApiResponse } from '../types';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating a text entry
const createTextSchema = z.object({
  title: z.string().min(1).max(500),
  author: z.string().max(255).optional(),
  isbn: z.string().max(13).optional(),
  type: z.string().optional(),
  edition: z.string().max(100).optional(),
  url: z.string().url().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Create or find a text entry (book, article, etc.)
 * POST /api/texts
 */
export const createText = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    const validationResult = createTextSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        message: validationResult.error.message,
      } as ApiResponse);
    }

    const data = validationResult.data;

    // Check if text already exists by title and author
    let text = await prisma.text.findFirst({
      where: {
        title: data.title,
        author: data.author || null,
      },
    });

    // If text doesn't exist, create it
    if (!text) {
      text = await prisma.text.create({
        data: {
          title: data.title,
          author: data.author,
          isbn: data.isbn,
          type: data.type,
          edition: data.edition,
          url: data.url,
          metadata: data.metadata as any,
        },
      });
    }

    // Create or update user document entry
    await prisma.userDocument.upsert({
      where: {
        userId_textId: {
          userId: req.user.id,
          textId: text.id,
        },
      },
      update: {
        lastAccessed: new Date(),
      },
      create: {
        userId: req.user.id,
        textId: text.id,
        lastAccessed: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      data: text,
    } as ApiResponse);
  } catch (error) {
    console.error('Error creating text:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create text',
    } as ApiResponse);
  }
};

/**
 * Get user's document library
 * GET /api/texts
 */
export const getUserTexts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    const userDocuments = await prisma.userDocument.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        text: true,
      },
      orderBy: {
        lastAccessed: 'desc',
      },
    });

    return res.json({
      success: true,
      data: userDocuments.map((doc) => ({
        ...doc.text,
        lastAccessed: doc.lastAccessed,
      })),
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching user texts:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch texts',
    } as ApiResponse);
  }
};

/**
 * Get a specific text by ID
 * GET /api/texts/:id
 */
export const getTextById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const text = await prisma.text.findUnique({
      where: { id },
    });

    if (!text) {
      return res.status(404).json({
        success: false,
        error: 'Text not found',
      } as ApiResponse);
    }

    return res.json({
      success: true,
      data: text,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching text:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch text',
    } as ApiResponse);
  }
};
