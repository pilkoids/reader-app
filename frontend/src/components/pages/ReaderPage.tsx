import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReaderPane from '../reader/ReaderPane';
import textService from '../../services/textService';
import { useDocument } from '../../contexts/DocumentContext';

interface Document {
  title: string;
  author?: string;
  content: string[];
  totalPages: number;
}

const ReaderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentDocument, currentTextId, setCurrentDocument } = useDocument();

  const [document, setDocument] = useState<Document | null>(null);
  const [textId, setTextId] = useState<string | null>(null);
  const [textMetadata, setTextMetadata] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    // Initialize from location state or context
    if (location.state?.document) {
      // New document from upload
      setDocument(location.state.document);
      setTextId(null); // Will be created
    } else if (location.state?.textId) {
      // Coming from library with textId
      if (currentDocument && currentTextId === location.state.textId) {
        // Document is in context
        setDocument(currentDocument);
        setTextId(currentTextId);
      } else {
        // Document not in memory
        setDocument(null);
        setTextId(location.state.textId);
      }
    }
  }, [location.state, currentDocument, currentTextId]);

  useEffect(() => {
    // Create text entry when we have a new document without textId
    if (document && !textId) {
      createTextEntry();
    }
    // Load metadata when we have textId but no document
    else if (textId && !document) {
      loadTextMetadata();
    }
  }, [document, textId]);

  const loadTextMetadata = async () => {
    if (!textId) return;
    try {
      const text = await textService.getTextById(textId);
      setTextMetadata(text);
    } catch (error) {
      console.error('Error loading text metadata:', error);
    }
  };

  const createTextEntry = async () => {
    if (!document) return;

    try {
      const text = await textService.createText({
        title: document.title,
        author: document.author,
        type: document.title.toLowerCase().endsWith('.pdf') ? 'pdf' :
              document.title.toLowerCase().endsWith('.epub') ? 'epub' : 'txt',
      });
      setTextId(text.id);
      // Store in context for reuse
      setCurrentDocument(document, text.id);
    } catch (error) {
      console.error('Error creating text entry:', error);
    }
  };

  const handlePageChange = (page: number) => {
    if (document && page >= 1 && page <= document.totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <ReaderPane
      document={document}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      showComments={showComments}
      onToggleComments={() => setShowComments(!showComments)}
      textId={textId}
      textMetadata={textMetadata}
    />
  );
};

export default ReaderPage;
