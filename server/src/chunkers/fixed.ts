import { ChunkRecord, ChunkOptions } from '../types.js';

/**
 * STRATEGY: Fixed-Size Character Chunking (Without Overlap)
 * 
 * Educational Concept:
 * The simplest chunking method. The document is chopped into rigid windows
 * of exact character length (N characters) from start to end without overlap.
 * 
 * Strengths:
 * - Extremely fast, deterministic, simple O(N) complexity.
 * - Predictable chunk count: ceil(totalCharacters / chunkSize).
 * 
 * Weaknesses & Trade-offs:
 * - Blind to semantic boundaries: often cuts right through the middle of words,
 *   sentences, code blocks, or paragraphs.
 * - Information at the cut boundary gets split: "superconductor" might become
 *   "superc" in chunk 1 and "onductor" in chunk 2.
 */
export function chunkFixed(
  docId: string,
  content: string,
  options: ChunkOptions
): ChunkRecord[] {
  const chunkSize = Math.max(20, options.chunkSize || 200);
  const chunks: ChunkRecord[] = [];
  const totalLength = content.length;

  let currentStart = 0;
  let index = 0;

  while (currentStart < totalLength) {
    const currentEnd = Math.min(currentStart + chunkSize, totalLength);
    const chunkText = content.slice(currentStart, currentEnd);

    // Approximate token count: ~4 characters per token in English
    const estimatedTokens = Math.max(1, Math.round(chunkText.length / 4));
    const wordCount = chunkText.trim().length > 0 ? chunkText.trim().split(/\s+/).length : 0;

    chunks.push({
      id: `${docId}_chunk_${index}`,
      docId,
      index,
      text: chunkText,
      startChar: currentStart,
      endChar: currentEnd,
      charCount: chunkText.length,
      wordCount,
      tokenCount: estimatedTokens,
      overlapWithPrev: 0,
      overlapWithNext: 0,
    });

    currentStart = currentEnd;
    index++;
  }

  return chunks;
}
