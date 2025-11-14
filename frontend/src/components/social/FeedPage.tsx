import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import commentService, { Comment } from '../../services/commentService';

const FeedPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const feed = await commentService.getCommentFeed();
      setComments(feed);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Feed</h1>
          <p className="text-gray-600">
            Recent annotations from readers you follow
          </p>
        </div>

        {/* Feed */}
        {comments.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <ChatBubbleLeftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No annotations yet
            </h3>
            <p className="text-gray-600 mb-4">
              Follow readers to see their annotations in your feed
            </p>
            <button
              onClick={() => window.location.href = '/following'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Find Readers to Follow
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* User Info & Date */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {comment.user.avatarUrl ? (
                      <img
                        src={comment.user.avatarUrl}
                        alt={comment.user.displayName || comment.user.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {(comment.user.displayName || comment.user.username)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {comment.user.displayName || comment.user.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{comment.user.username}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                {/* Book Info */}
                {comment.text && (
                  <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                    <BookOpenIcon className="w-4 h-4" />
                    <span className="font-medium">{comment.text.title}</span>
                    {comment.text.author && (
                      <span className="text-gray-500">by {comment.text.author}</span>
                    )}
                    {comment.pageNumber && (
                      <span className="text-gray-500">• Page {comment.pageNumber}</span>
                    )}
                  </div>
                )}

                {/* Quoted Text */}
                {comment.selectedText && (
                  <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-gray-900 italic">"{comment.selectedText}"</p>
                  </div>
                )}

                {/* Comment Text */}
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {comment.commentText}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
