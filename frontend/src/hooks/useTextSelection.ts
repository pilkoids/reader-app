import { useState, useCallback, useEffect, RefObject } from 'react';

export interface TextSelection {
  text: string;
  startOffset: number;
  endOffset: number;
  contextBefore: string;
  contextAfter: string;
}

/**
 * Hook to handle text selection in a document
 * @param containerRef Reference to the container element
 * @param fullText The complete document text
 * @param contextLength How many characters to include before/after selection
 */
export const useTextSelection = (
  containerRef: RefObject<HTMLElement | null>,
  fullText: string,
  contextLength: number = 100
) => {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelection = useCallback(() => {
    const windowSelection = window.getSelection();

    if (!windowSelection || windowSelection.rangeCount === 0) {
      setSelection(null);
      return;
    }

    const selectedText = windowSelection.toString().trim();

    // Only process if there's actual text selected
    if (selectedText.length === 0) {
      setSelection(null);
      return;
    }

    // Make sure selection is within our container
    const range = windowSelection.getRangeAt(0);
    const container = containerRef.current;

    if (!container || !container.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    // Find the position in the full text
    // Note: This is a simple approach that works when displaying plain text
    // For more complex layouts, you may need a more sophisticated approach
    const containerText = container.innerText;
    const startOffsetInContainer = containerText.indexOf(selectedText);

    if (startOffsetInContainer === -1) {
      console.warn('Could not find selected text in container');
      setSelection(null);
      return;
    }

    // Calculate actual offsets in the full document text
    const startOffset = fullText.indexOf(selectedText, 0);
    const endOffset = startOffset + selectedText.length;

    if (startOffset === -1) {
      console.warn('Could not find selected text in full document');
      setSelection(null);
      return;
    }

    // Extract context
    const contextStart = Math.max(0, startOffset - contextLength);
    const contextEnd = Math.min(fullText.length, endOffset + contextLength);

    const contextBefore = fullText.substring(contextStart, startOffset);
    const contextAfter = fullText.substring(endOffset, contextEnd);

    setSelection({
      text: selectedText,
      startOffset,
      endOffset,
      contextBefore,
      contextAfter,
    });

    setIsSelecting(true);
  }, [containerRef, fullText, contextLength]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setIsSelecting(false);
    window.getSelection()?.removeAllRanges();
  }, []);

  // Listen for selection changes
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Only process if mouse up is within the text container
      const container = containerRef.current;
      if (!container) return;

      const target = e.target as Node;
      if (container.contains(target)) {
        // Small delay to ensure selection is complete
        setTimeout(handleSelection, 10);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleSelection, containerRef]);

  return {
    selection,
    isSelecting,
    clearSelection,
  };
};
