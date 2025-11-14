import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Document {
  title: string;
  author?: string;
  content: string[];
  totalPages: number;
}

interface DocumentContextType {
  currentDocument: Document | null;
  currentTextId: string | null;
  setCurrentDocument: (doc: Document | null, textId: string | null) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentDocument, setDocument] = useState<Document | null>(null);
  const [currentTextId, setTextId] = useState<string | null>(null);

  const setCurrentDocument = (doc: Document | null, textId: string | null) => {
    setDocument(doc);
    setTextId(textId);
  };

  return (
    <DocumentContext.Provider value={{ currentDocument, currentTextId, setCurrentDocument }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};
