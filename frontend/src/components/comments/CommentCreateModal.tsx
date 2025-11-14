import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import commentService, { CreateCommentData } from '../../services/commentService';

interface CommentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommentCreated: () => void;
  textId: string;
  selectedText: string;
  contextBefore: string;
  contextAfter: string;
  startOffset: number;
  endOffset: number;
  currentPage?: number;
}

const CommentCreateModal: React.FC<CommentCreateModalProps> = ({
  isOpen,
  onClose,
  onCommentCreated,
  textId,
  selectedText,
  contextBefore,
  contextAfter,
  startOffset,
  endOffset,
  currentPage,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: CreateCommentData = {
        textId,
        selectedText,
        contextBefore,
        contextAfter,
        commentText: commentText.trim(),
        startOffset,
        endOffset,
        pageNumber: currentPage,
        isPublic,
      };

      await commentService.createComment(data);

      // Reset and close
      setCommentText('');
      onCommentCreated();
      onClose();
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Failed to create comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCommentText('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Add Comment</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Selected Text Preview */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Selected text:</p>
          <p className="text-gray-900 italic">
            "{selectedText.length > 200 ? selectedText.substring(0, 200) + '...' : selectedText}"
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Comment Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Comment
            </label>
            <textarea
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
              placeholder="Share your thoughts about this passage..."
              disabled={loading}
            />
          </div>

          {/* Visibility Toggle */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-700">
                Make this comment public (visible to your followers)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={loading || !commentText.trim()}
            >
              {loading ? 'Saving...' : 'Save Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentCreateModal;
