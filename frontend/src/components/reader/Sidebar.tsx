import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpenIcon,
  ArrowUpTrayIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { User } from '../../types';

interface SidebarProps {
  currentUser: User;
  onOpenDocument: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, onOpenDocument, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`bg-gray-900 text-gray-100 h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold">Reader Noter</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.username}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {currentUser.displayName || currentUser.username}
              </p>
              <p className="text-xs text-gray-400 truncate">
                @{currentUser.username}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Open Document Button */}
        <button
          onClick={onOpenDocument}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium"
          title="Open Document"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          {!isCollapsed && <span>Open Document</span>}
        </button>

        {/* Feed */}
        <button
          onClick={() => navigate('/feed')}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            isActive('/feed')
              ? 'bg-gray-800 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
          title="Your Feed"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          {!isCollapsed && <span>Your Feed</span>}
        </button>

        {/* Following */}
        <button
          onClick={() => navigate('/following')}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            isActive('/following')
              ? 'bg-gray-800 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
          title="Following"
        >
          <UsersIcon className="w-5 h-5" />
          {!isCollapsed && <span>Following</span>}
        </button>

        {/* My Library */}
        <button
          onClick={() => navigate('/library')}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            isActive('/library')
              ? 'bg-gray-800 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
          title="My Library"
        >
          <BookOpenIcon className="w-5 h-5" />
          {!isCollapsed && <span>My Library</span>}
        </button>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          {!isCollapsed ? 'Logout' : 'Out'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
