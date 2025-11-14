// User types
export interface User {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

// Text/Document types
export interface Text {
  id: string;
  title: string;
  author?: string;
  isbn?: string;
  type?: string;
  edition?: string;
  url?: string;
}

// Comment types
export interface Comment {
  id: string;
  userId: string;
  textId: string;
  commentText: string;

  // Position data
  chapter?: string;
  pageNumber?: number;
  paragraphNumber?: number;
  characterOffset?: number;

  // Text anchoring
  selectedText?: string;
  contextBefore?: string;
  contextAfter?: string;
  fingerprint?: string;

  isPublic: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: User;
}

// Subscription types
export interface Subscription {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: User;
  following?: User;
}

// Text anchor for creating comments
export interface TextAnchor {
  startOffset: number;
  endOffset: number;
  selectedText: string;
  contextBefore: string;
  contextAfter: string;
  fingerprint: string;
}

// Comment position for rendering
export interface CommentPosition {
  commentId: string;
  yPosition: number;
  avatarUrl?: string;
  author: User;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
