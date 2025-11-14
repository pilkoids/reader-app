import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Comment } from '../../services/commentService';

interface CommentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: Comment | null;
}

const CommentViewModal: React.FC<CommentViewModalProps> = ({
  isOpen,
  onClose,
  comment,
}) => {
  if (!isOpen || !comment) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        {/* Header with User Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {comment.user.avatarUrl ? (
              <img
                src={comment.user.avatarUrl}
                alt={comment.user.displayName || comment.user.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {(comment.user.displayName || comment.user.username).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900">
                {comment.user.displayName || comment.user.username}
              </h3>
              <p className="text-sm text-gray-500">@{comment.user.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Selected Text */}
        {comment.selectedText && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Highlighted text:</p>
            <p className="text-gray-900 italic">"{comment.selectedText}"</p>
          </div>
        )}

        {/* Comment Text */}
        <div className="mb-4">
          <p className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">
            {comment.commentText}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
          <div>
            {comment.pageNumber && (
              <span className="mr-4">Page {comment.pageNumber}</span>
            )}
            {comment.chapter && <span>Chapter: {comment.chapter}</span>}
          </div>
          <span>{formatDate(comment.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default CommentViewModal;
