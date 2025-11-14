import api from './api';

export interface CreateCommentData {
  textId: string;
  selectedText: string;
  contextBefore: string;
  contextAfter: string;
  commentText: string;
  startOffset: number;
  endOffset: number;
  chapter?: string;
  pageNumber?: number;
  paragraphNumber?: number;
  isPublic?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  textId: string;
  selectedText: string | null;
  contextBefore: string | null;
  contextAfter: string | null;
  fingerprint: string | null;
  commentText: string;
  characterOffset: number | null;
  chapter: string | null;
  pageNumber: number | null;
  paragraphNumber: number | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  text?: {
    id: string;
    title: string;
    author: string | null;
  };
}

const commentService = {
  /**
   * Create a new comment
   */
  async createComment(data: CreateCommentData): Promise<Comment> {
    const response = await api.post('/comments', data);
    return response.data.data;
  },

  /**
   * Get comments for a specific text
   */
  async getCommentsByTextId(textId: string): Promise<Comment[]> {
    const response = await api.get(`/comments?textId=${textId}`);
    return response.data.data;
  },

  /**
   * Get comment feed from followed users
   */
  async getCommentFeed(): Promise<Comment[]> {
    const response = await api.get('/comments/feed');
    return response.data.data;
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },
};

export default commentService;
