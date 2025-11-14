import { Request } from 'express';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

// Text anchor for comment positioning
export interface TextAnchor {
  startOffset: number;
  endOffset: number;
  selectedText: string;
  contextBefore: string;
  contextAfter: string;
  fingerprint: string;
}

// Comment position data
export interface CommentPosition {
  commentId: string;
  yPosition?: number;
  avatarUrl?: string;
  author: {
    id: string;
    username: string;
    displayName?: string;
  };
}

// Text matching result
export interface TextMatch {
  position: number;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'approximate';
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
