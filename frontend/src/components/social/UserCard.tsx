import React, { useState } from 'react';
import { User } from '../../services/subscriptionService';

interface UserCardProps {
  user: User;
  isFollowing: boolean;
  onFollow: (userId: string) => Promise<void>;
  onUnfollow: (userId: string) => Promise<void>;
  showFollowButton?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isFollowing,
  onFollow,
  onUnfollow,
  showFollowButton = true,
}) => {
  const [loading, setLoading] = useState(false);

  const handleFollowClick = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await onUnfollow(user.id);
      } else {
        await onFollow(user.id);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName || user.username}
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {(user.displayName || user.username).charAt(0).toUpperCase()}
          </div>
        )}

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {user.displayName || user.username}
          </h3>
          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Follow Button */}
      {showFollowButton && (
        <button
          onClick={handleFollowClick}
          disabled={loading}
          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
            isFollowing
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};

export default UserCard;
