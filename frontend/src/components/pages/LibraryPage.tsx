import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import textService from '../../services/textService';
import commentService from '../../services/commentService';
import { useDocument } from '../../contexts/DocumentContext';

interface LibraryDocument {
  id: string;
  title: string;
  author: string | null;
  type: string | null;
  lastAccessed?: string;
  commentCount?: number;
}

const LibraryPage: React.FC = () => {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<LibraryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'author'>('recent');
  const navigate = useNavigate();
  const { currentDocument, currentTextId } = useDocument();

  useEffect(() => {
    loadLibrary();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [documents, searchQuery, sortBy]);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const texts = await textService.getUserTexts();

      // Load comment counts for each text
      const docsWithCounts = await Promise.all(
        texts.map(async (text) => {
          try {
            const comments = await commentService.getCommentsByTextId(text.id);
            return {
              ...text,
              commentCount: comments.length,
            };
          } catch (error) {
            return {
              ...text,
              commentCount: 0,
            };
          }
        })
      );

      setDocuments(docsWithCounts);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let filtered = [...documents];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc.author && doc.author.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return (a.author || '').localeCompare(b.author || '');
        case 'recent':
        default:
          return new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime();
      }
    });

    setFilteredDocs(filtered);
  };

  const handleOpenDocument = (docId: string) => {
    // Check if this document is currently loaded in memory
    if (currentDocument && currentTextId === docId) {
      // Document is in memory, navigate with the full document
      navigate('/reader', { state: { document: currentDocument, textId: docId } });
    } else {
      // Document not in memory, navigate with just textId (will show re-upload message)
      navigate('/reader', { state: { textId: docId } });
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never opened';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getFileTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-700';
      case 'epub':
        return 'bg-purple-100 text-purple-700';
      case 'txt':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
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
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">Your reading history and documents</p>
        </div>

        {documents.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg p-12 text-center">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-600 mb-6">
              Open a document to start reading and adding annotations
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              <span>Open Document</span>
            </button>
          </div>
        ) : (
          <>
            {/* Search and Sort Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="recent">Recently Opened</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="author">Author (A-Z)</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredDocs.length} of {documents.length} documents
              </div>
            </div>

            {/* Document Grid */}
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600">No documents match your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleOpenDocument(doc.id)}
                    className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow text-left group"
                  >
                    {/* File Type Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium uppercase ${getFileTypeColor(
                          doc.type
                        )}`}
                      >
                        {doc.type || 'DOC'}
                      </span>
                      <BookOpenIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {doc.title}
                    </h3>

                    {/* Author */}
                    {doc.author && (
                      <p className="text-sm text-gray-600 mb-3">by {doc.author}</p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatDate(doc.lastAccessed)}</span>
                      </div>
                      {doc.commentCount !== undefined && doc.commentCount > 0 && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          <span>{doc.commentCount}</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
