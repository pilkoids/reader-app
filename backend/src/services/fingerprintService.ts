import crypto from 'crypto';

/**
 * Service for generating text fingerprints for comment anchoring
 * Uses SHA-256 hashing to create unique identifiers for text snippets
 */
export class FingerprintService {
  /**
   * Generate a fingerprint for a text selection with context
   * @param selectedText The text that was highlighted
   * @param contextBefore Text immediately before the selection
   * @param contextAfter Text immediately after the selection
   * @returns SHA-256 hash as hex string
   */
  generateFingerprint(
    selectedText: string,
    contextBefore: string,
    contextAfter: string
  ): string {
    // Normalize the text: trim whitespace, lowercase, remove extra spaces
    const normalized = this.normalizeText(selectedText + contextBefore + contextAfter);

    // Create SHA-256 hash
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Normalize text for consistent fingerprinting
   * - Convert to lowercase
   * - Trim whitespace
   * - Replace multiple spaces with single space
   * - Remove special formatting characters
   */
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'");
  }

  /**
   * Extract context around a position in text
   * @param fullText The complete document text
   * @param startOffset Starting position of selection
   * @param endOffset Ending position of selection
   * @param contextLength How many characters to include before/after
   */
  extractContext(
    fullText: string,
    startOffset: number,
    endOffset: number,
    contextLength: number = 100
  ): {
    selectedText: string;
    contextBefore: string;
    contextAfter: string;
  } {
    const selectedText = fullText.substring(startOffset, endOffset);

    // Get context before (up to contextLength chars)
    const contextStartPos = Math.max(0, startOffset - contextLength);
    const contextBefore = fullText.substring(contextStartPos, startOffset);

    // Get context after (up to contextLength chars)
    const contextEndPos = Math.min(fullText.length, endOffset + contextLength);
    const contextAfter = fullText.substring(endOffset, contextEndPos);

    return {
      selectedText,
      contextBefore,
      contextAfter,
    };
  }

  /**
   * Find a text snippet in a document by fingerprint
   * Uses sliding window approach
   * @param fingerprint The fingerprint to search for
   * @param documentText The full document text
   * @param snippetLength Approximate length of the original snippet
   * @returns Position in document or null if not found
   */
  findByFingerprint(
    fingerprint: string,
    documentText: string,
    snippetLength: number = 100
  ): number | null {
    // Use a sliding window to check all possible positions
    const windowSize = snippetLength * 3; // Include context in window

    for (let i = 0; i <= documentText.length - windowSize; i++) {
      const window = documentText.substring(i, i + windowSize);
      const windowFingerprint = crypto
        .createHash('sha256')
        .update(this.normalizeText(window))
        .digest('hex');

      if (windowFingerprint === fingerprint) {
        return i;
      }
    }

    return null;
  }
}

export const fingerprintService = new FingerprintService();
