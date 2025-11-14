import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { useTextSelection } from '../../hooks/useTextSelection';
import CommentCreateModal from '../comments/CommentCreateModal';
import CommentViewModal from '../comments/CommentViewModal';
import CommentMarker from '../comments/CommentMarker';
import commentService, { Comment } from '../../services/commentService';

interface ReaderPaneProps {
  document: {
    title: string;
    author?: string;
    content: string[];
    totalPages: number;
  } | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  showComments: boolean;
  onToggleComments: () => void;
  textId: string | null; // The ID of the text in the database
  textMetadata?: any; // Metadata when coming from library without document content
}

const ReaderPane: React.FC<ReaderPaneProps> = ({
  document,
  currentPage,
  onPageChange,
  showComments,
  onToggleComments,
  textId,
  textMetadata,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [savedSelection, setSavedSelection] = useState<{
    text: string;
    startOffset: number;
    endOffset: number;
    contextBefore: string;
    contextAfter: string;
  } | null>(null);

  const textContainerRef = useRef<HTMLDivElement>(null);

  // Get full text of current page for selection
  const fullText = document ? document.content[currentPage - 1] : '';

  // Use text selection hook
  const { selection, clearSelection } = useTextSelection(textContainerRef, fullText);

  // Load comments when textId changes or document changes
  useEffect(() => {
    if (textId && showComments) {
      loadComments();
    }
  }, [textId, showComments]);

  const loadComments = async () => {
    if (!textId) return;

    setLoadingComments(true);
    try {
      const fetchedComments = await commentService.getCommentsByTextId(textId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Save selection data and open modal when text is selected
  useEffect(() => {
    if (selection && selection.text.length > 0) {
      setSavedSelection(selection);
      setIsCreateModalOpen(true);
    }
  }, [selection]);

  const handleCommentCreated = () => {
    setSavedSelection(null);
    clearSelection();
    loadComments();
  };

  const handleCommentMarkerClick = (comment: Comment) => {
    setSelectedComment(comment);
    setIsViewModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSavedSelection(null);
    clearSelection();
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedComment(null);
  };

  // Filter comments for current page
  const pageComments = comments.filter(
    (comment) => comment.pageNumber === currentPage
  );

  // Calculate vertical positions for comments based on text position
  const getCommentPosition = (comment: Comment): number | null => {
    if (!textContainerRef.current || !comment.characterOffset) return null;

    const container = textContainerRef.current;
    const text = container.innerText;

    // Create a temporary range to find the position
    try {
      const textNode = container.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        // If not a text node, try to find text nodes
        const walker = window.document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
          null
        );
        const textNodes: Text[] = [];
        let node;
        while ((node = walker.nextNode())) {
          textNodes.push(node as Text);
        }

        if (textNodes.length === 0) return null;

        // Find which text node contains our offset
        let accumulatedLength = 0;
        for (const textNode of textNodes) {
          const nodeLength = textNode.length;
          if (accumulatedLength + nodeLength >= comment.characterOffset) {
            const offsetInNode = comment.characterOffset - accumulatedLength;
            const range = window.document.createRange();
            range.setStart(textNode, Math.min(offsetInNode, nodeLength));
            range.setEnd(textNode, Math.min(offsetInNode + 1, nodeLength));
            const rect = range.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return rect.top - containerRect.top;
          }
          accumulatedLength += nodeLength;
        }
      } else {
        // Simple case: single text node
        const range = window.document.createRange();
        range.setStart(textNode, Math.min(comment.characterOffset, text.length));
        range.setEnd(textNode, Math.min(comment.characterOffset + 1, text.length));
        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return rect.top - containerRect.top;
      }
    } catch (error) {
      console.error('Error calculating comment position:', error);
    }

    return null;
  };

  if (!document) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">📖</div>
          {textMetadata ? (
            <>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">{textMetadata.title}</h2>
              {textMetadata.author && (
                <p className="text-lg text-gray-600 mb-4">by {textMetadata.author}</p>
              )}
              <p className="text-gray-500 mb-6">
                This document was previously opened but is no longer in memory.
                Please re-upload or open the file to continue reading and viewing annotations.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Open Document
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">No Document Loaded</h2>
              <p className="text-gray-500">
                Click "Open Document" in the sidebar to upload a PDF, ebook, or paste text.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex-1 bg-white flex flex-col ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
        {/* Control Bar */}
        <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold truncate max-w-md">{document.title}</h2>
            {document.author && (
              <span className="text-sm text-gray-300">by {document.author}</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle Comments */}
            <button
              onClick={onToggleComments}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              title={showComments ? 'Hide Comments' : 'Show Comments'}
            >
              {showComments ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              <span className="text-sm">{showComments ? 'Hide' : 'Show'} Comments</span>
            </button>

            {/* Maximize/Minimize */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title={isMaximized ? 'Minimize' : 'Maximize'}
            >
              {isMaximized ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Text Display Area with Comments */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative max-w-6xl mx-auto">
            {/* Main text content */}
            <div className="px-8 py-12 max-w-4xl">
              <div className="prose prose-lg max-w-none">
                <div
                  ref={textContainerRef}
                  className="whitespace-pre-wrap leading-relaxed text-gray-800 select-text cursor-text"
                  style={{ userSelect: 'text' }}
                >
                  {document.content[currentPage - 1]}
                </div>
              </div>

              {/* Selection hint */}
              {!showComments && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <p className="text-sm">
                      Enable comments to see annotations and add your own by selecting text.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Comments in right margin */}
            {showComments && pageComments.length > 0 && (
              <div className="absolute right-4 top-0 w-16">
                {pageComments.map((comment) => {
                  const position = getCommentPosition(comment);
                  if (position === null) return null;

                  return (
                    <div
                      key={comment.id}
                      className="absolute"
                      style={{ top: `${position}px` }}
                    >
                      <CommentMarker
                        comment={comment}
                        onClick={handleCommentMarkerClick}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Loading indicator for comments */}
            {showComments && loadingComments && (
              <div className="absolute right-4 top-12 text-sm text-gray-500">
                Loading comments...
              </div>
            )}

            {/* No comments message */}
            {showComments && !loadingComments && pageComments.length === 0 && (
              <div className="absolute right-4 top-12 text-sm text-gray-500 max-w-xs">
                <p className="text-center">No comments on this page yet.</p>
                <p className="text-center mt-2 text-xs">Select text to add one!</p>
              </div>
            )}
          </div>
        </div>

        {/* Page Navigation */}
        <div className="bg-gray-100 border-t border-gray-300 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="text-sm text-gray-600">
            Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{document.totalPages}</span>
            {showComments && pageComments.length > 0 && (
              <span className="ml-3 text-blue-600">
                ({pageComments.length} {pageComments.length === 1 ? 'comment' : 'comments'})
              </span>
            )}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= document.totalPages}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comment Creation Modal */}
      {savedSelection && textId && (
        <CommentCreateModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onCommentCreated={handleCommentCreated}
          textId={textId}
          selectedText={savedSelection.text}
          contextBefore={savedSelection.contextBefore}
          contextAfter={savedSelection.contextAfter}
          startOffset={savedSelection.startOffset}
          endOffset={savedSelection.endOffset}
          currentPage={currentPage}
        />
      )}

      {/* Comment View Modal */}
      <CommentViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        comment={selectedComment}
      />
    </>
  );
};

export default ReaderPane;
