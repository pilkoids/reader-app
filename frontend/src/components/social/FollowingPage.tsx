import React, { useState, useEffect } from 'react';
import { UserGroupIcon, UsersIcon } from '@heroicons/react/24/outline';
import subscriptionService, { User } from '../../services/subscriptionService';
import UserCard from './UserCard';

const FollowingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'suggestions'>('following');
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [followingData, followersData, suggestionsData] = await Promise.all([
        subscriptionService.getFollowing(),
        subscriptionService.getFollowers(),
        subscriptionService.getSuggestedUsers(),
      ]);

      setFollowing(followingData);
      setFollowers(followersData);
      setSuggestions(suggestionsData);

      // Create following map
      const map: Record<string, boolean> = {};
      followingData.forEach((user) => {
        map[user.id] = true;
      });
      setFollowingMap(map);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    await subscriptionService.followUser(userId);
    setFollowingMap({ ...followingMap, [userId]: true });
    await loadData(); // Refresh data
  };

  const handleUnfollow = async (userId: string) => {
    await subscriptionService.unfollowUser(userId);
    const newMap = { ...followingMap };
    delete newMap[userId];
    setFollowingMap(newMap);
    await loadData(); // Refresh data
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social</h1>
          <p className="text-gray-600">
            Follow readers you admire and discover their annotations
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('following')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'following'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>Following ({following.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('followers')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'followers'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UsersIcon className="w-5 h-5" />
                <span>Followers ({followers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('suggestions')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'suggestions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>Suggestions ({suggestions.length})</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {activeTab === 'following' && (
            <>
              {following.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center">
                  <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Not following anyone yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start following readers to see their annotations
                  </p>
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Suggestions
                  </button>
                </div>
              ) : (
                following.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFollowing={true}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'followers' && (
            <>
              {followers.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center">
                  <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No followers yet
                  </h3>
                  <p className="text-gray-600">
                    Keep adding annotations to attract followers
                  </p>
                </div>
              ) : (
                followers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFollowing={!!followingMap[user.id]}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'suggestions' && (
            <>
              {suggestions.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center">
                  <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No suggestions available
                  </h3>
                  <p className="text-gray-600">
                    Open some documents to see suggestions based on other readers' comments
                  </p>
                </div>
              ) : (
                suggestions.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFollowing={!!followingMap[user.id]}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowingPage;
