import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import MainLayout from './components/layout/MainLayout';
import ReaderPage from './components/pages/ReaderPage';
import LibraryPage from './components/pages/LibraryPage';
import FeedPage from './components/social/FeedPage';
import FollowingPage from './components/social/FollowingPage';
import { authService } from './services/authService';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes with Sidebar Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested Routes */}
          <Route index element={<Navigate to="/feed" replace />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="following" element={<FollowingPage />} />
          <Route path="reader" element={<ReaderPage />} />
          <Route path="library" element={<LibraryPage />} />
        </Route>

        {/* 404 - Redirect to feed */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
