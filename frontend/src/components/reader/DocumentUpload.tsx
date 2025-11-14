import React, { useState, useRef } from 'react';
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface DocumentUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentLoaded: (document: {
    title: string;
    author?: string;
    content: string[];
    totalPages: number;
  }) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ isOpen, onClose, onDocumentLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'pdf') {
        await handlePDF(file);
      } else if (fileExtension === 'epub') {
        await handleEPUB(file);
      } else if (fileExtension === 'txt') {
        await handleTextFile(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF, EPUB, or TXT file.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
      console.error('Error loading document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePDF = async (file: File) => {
    // Dynamic import to avoid loading pdf.js initially
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker path - use local copy instead of CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const content: string[] = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      content.push(pageText);
    }

    onDocumentLoaded({
      title: file.name.replace('.pdf', ''),
      content,
      totalPages: pdf.numPages
    });

    onClose();
  };

  const handleEPUB = async (file: File) => {
    // Dynamic import
    const ePub = (await import('epubjs')).default;

    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);

    await book.ready;

    const content: string[] = [];
    let title = file.name.replace('.epub', '');
    let author: string | undefined;

    // Get metadata
    const metadata = await book.loaded.metadata;
    if (metadata.title) title = metadata.title;
    if (metadata.creator) author = metadata.creator;

    // Get all sections from the book
    const spine = await book.loaded.spine;

    // Use a simpler approach - iterate through spine items
    const spineItems = Array.isArray(spine) ? spine : (spine as any).items || [];

    for (let i = 0; i < spineItems.length; i++) {
      try {
        const item = spineItems[i];
        // Get the section/chapter
        const section = await book.section(item.href || item.idref || i);

        if (section) {
          // Try to get text content
          const sectionContent = await section.load(book.load.bind(book));

          if (sectionContent && sectionContent.body) {
            const text = sectionContent.body.textContent || '';
            if (text.trim()) {
              content.push(text.trim());
            }
          }
        }
      } catch (err) {
        console.error('Error loading EPUB section:', err);
        // Continue with other sections
      }
    }

    onDocumentLoaded({
      title,
      author,
      content: content.length > 0 ? content : ['Failed to extract text from EPUB. Try a different file format.'],
      totalPages: content.length > 0 ? content.length : 1
    });

    onClose();
  };

  const handleTextFile = async (file: File) => {
    const text = await file.text();

    // Split into pages (every ~2000 characters)
    const pageSize = 2000;
    const content: string[] = [];

    for (let i = 0; i < text.length; i += pageSize) {
      content.push(text.substring(i, i + pageSize));
    }

    onDocumentLoaded({
      title: file.name.replace('.txt', ''),
      content,
      totalPages: content.length
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Open Document</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="space-y-4">
              <ArrowPathIcon className="w-12 h-12 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Loading document...</p>
            </div>
          ) : (
            <>
              <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your document here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <span className="flex items-center space-x-2">
                  <DocumentIcon className="w-5 h-5" />
                  <span>Choose File</span>
                </span>
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Supports: PDF, EPUB, TXT
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.epub,.txt"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default DocumentUpload;
