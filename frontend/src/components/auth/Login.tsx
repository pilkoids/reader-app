import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { User } from '../../types';

const Login: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMockUsers();
  }, []);

  const loadMockUsers = async () => {
    try {
      setLoading(true);
      const mockUsers = await authService.getMockUsers();
      setUsers(mockUsers);
      setError(null);
    } catch (err) {
      setError('Failed to load users. Make sure the backend is running.');
      console.error('Error loading mock users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userId: string) => {
    try {
      setLoggingIn(true);
      setSelectedUserId(userId);
      await authService.mockLogin(userId);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoggingIn(false);
      setSelectedUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Reader Noter
          </h1>
          <p className="text-lg text-gray-600">
            Social reading annotations platform
          </p>
          <p className="text-sm text-gray-500 mt-2">
            MVP - Select a mock user to login (no password required)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Select Your User Persona
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                disabled={loggingIn}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all
                  ${selectedUserId === user.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                  }
                  ${loggingIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-start space-x-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user.displayName || user.username}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>

                {selectedUserId === user.id && loggingIn && (
                  <div className="mt-3 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-blue-600">Logging in...</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {users.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No mock users available. Make sure the database is seeded.
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            This is a demo authentication system. In production, this will be replaced
            with OAuth (Twitter/X login).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
