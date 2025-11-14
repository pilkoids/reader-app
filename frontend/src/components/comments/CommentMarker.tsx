import React from 'react';
import { Comment } from '../../services/commentService';

interface CommentMarkerProps {
  comment: Comment;
  onClick: (comment: Comment) => void;
}

const CommentMarker: React.FC<CommentMarkerProps> = ({ comment, onClick }) => {
  return (
    <button
      onClick={() => onClick(comment)}
      className="group relative"
      title={`Comment by ${comment.user.displayName || comment.user.username}`}
    >
      {comment.user.avatarUrl ? (
        <img
          src={comment.user.avatarUrl}
          alt={comment.user.displayName || comment.user.username}
          className="w-8 h-8 rounded-full border-2 border-blue-500 hover:border-blue-700 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-110"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 hover:border-blue-700 flex items-center justify-center text-white font-bold text-xs transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-110">
          {(comment.user.displayName || comment.user.username).charAt(0).toUpperCase()}
        </div>
      )}

      {/* Tooltip on hover */}
      <div className="absolute left-10 top-0 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
        {comment.user.displayName || comment.user.username}
      </div>
    </button>
  );
};

export default CommentMarker;
