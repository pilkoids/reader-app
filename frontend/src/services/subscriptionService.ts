import api from './api';

export interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt?: string;
  followedAt?: string;
}

const subscriptionService = {
  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<void> {
    await api.post('/subscriptions', { userId });
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<void> {
    await api.delete(`/subscriptions/${userId}`);
  },

  /**
   * Get list of users you're following
   */
  async getFollowing(): Promise<User[]> {
    const response = await api.get('/subscriptions/following');
    return response.data.data;
  },

  /**
   * Get list of your followers
   */
  async getFollowers(): Promise<User[]> {
    const response = await api.get('/subscriptions/followers');
    return response.data.data;
  },

  /**
   * Get suggested users to follow
   */
  async getSuggestedUsers(): Promise<User[]> {
    const response = await api.get('/subscriptions/suggestions');
    return response.data.data;
  },

  /**
   * Check if following specific users
   */
  async checkFollowing(userIds: string[]): Promise<Record<string, boolean>> {
    const response = await api.get(`/subscriptions/check?userIds=${userIds.join(',')}`);
    return response.data.data;
  },
};

export default subscriptionService;
