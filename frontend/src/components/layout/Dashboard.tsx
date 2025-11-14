import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import textService from '../../services/textService';
import { User } from '../../types';
import Sidebar from '../reader/Sidebar';
import ReaderPane from '../reader/ReaderPane';
import DocumentUpload from '../reader/DocumentUpload';

interface Document {
  title: string;
  author?: string;
  content: string[];
  totalPages: number;
}

const Dashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [textId, setTextId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showComments, setShowComments] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
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

  const handleDocumentLoaded = async (doc: Document) => {
    setDocument(doc);
    setCurrentPage(1);

    // Create text entry in backend
    try {
      const text = await textService.createText({
        title: doc.title,
        author: doc.author,
        type: doc.title.toLowerCase().endsWith('.pdf') ? 'pdf' :
              doc.title.toLowerCase().endsWith('.epub') ? 'epub' : 'txt',
      });
      setTextId(text.id);
    } catch (error) {
      console.error('Error creating text entry:', error);
      // Still allow viewing the document even if backend fails
    }
  };

  const handlePageChange = (page: number) => {
    if (document && page >= 1 && page <= document.totalPages) {
      setCurrentPage(page);
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
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - 20% */}
      <Sidebar
        currentUser={currentUser}
        onOpenDocument={() => setIsUploadOpen(true)}
        onLogout={handleLogout}
      />

      {/* Right Reader Pane - 80% */}
      <ReaderPane
        document={document}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        showComments={showComments}
        onToggleComments={() => setShowComments(!showComments)}
        textId={textId}
      />

      {/* Document Upload Modal */}
      <DocumentUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentLoaded={handleDocumentLoaded}
      />
    </div>
  );
};

export default Dashboard;
