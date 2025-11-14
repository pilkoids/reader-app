import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/authService';
import { User } from '../../types';
import Sidebar from '../reader/Sidebar';
import DocumentUpload from '../reader/DocumentUpload';
import { DocumentProvider } from '../../contexts/DocumentContext';

const MainLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUserLocal();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DocumentProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentUser={currentUser}
          onOpenDocument={() => setIsUploadOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <Outlet />

        {/* Document Upload Modal */}
        <DocumentUpload
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onDocumentLoaded={(doc) => {
            setIsUploadOpen(false);
            navigate('/reader', { state: { document: doc } });
          }}
        />
      </div>
    </DocumentProvider>
  );
};

export default MainLayout;
