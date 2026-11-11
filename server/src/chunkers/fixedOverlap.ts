import { ChunkRecord, ChunkOptions } from "../types.js";

/**
 * STRATEGY: Fixed-Size Character Chunking With Overlap (Sliding Window)
 *
 * Educational Concept:
 * When dividing text, important facts or relationships often span across
 * adjacent chunks (e.g. "The primary culprit was... [boundary] ...Dr. Smith.").
 *
 * A sliding window advances by (chunkSize - chunkOverlap) characters rather than chunkSize.
 * This guarantees that every segment near a boundary is duplicated into both the
 * preceding and subsequent chunk, preserving contextual continuity for embeddings.
 *
 * Trade-offs:
 * - Overlap adds redundancy: duplicate text increases the total chunk count,
 *   which proportionally raises embedding API costs and vector storage size.
 * - If overlap >= chunkSize, step size <= 0 causing an infinite loop. Hence:
 *   chunkOverlap must strictly be less than chunkSize (typically 10% to 20%).
 */
export function chunkFixedOverlap(
  docId: string,
  content: string,
  options: ChunkOptions,
): ChunkRecord[] {
  const chunkSize = Math.max(50, options.chunkSize || 200);
  // Ensure overlap is strictly less than chunk size (cap at chunkSize - 1)
  const chunkOverlap = Math.max(
    0,
    Math.min(options.chunkOverlap || 40, chunkSize - 1),
  );
  const stepSize = Math.max(1, chunkSize - chunkOverlap);

  const chunks: ChunkRecord[] = [];
  const totalLength = content.length;

  let currentStart = 0;
  let index = 0;

  while (currentStart < totalLength) {
    const currentEnd = Math.min(currentStart + chunkSize, totalLength);
    const chunkText = content.slice(currentStart, currentEnd);

    const estimatedTokens = Math.max(1, Math.round(chunkText.length / 4));
    const wordCount =
      chunkText.trim().length > 0 ? chunkText.trim().split(/\s+/).length : 0;

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

    if (currentEnd >= totalLength) {
      break;
    }

    currentStart += stepSize;
    index++;
  }

  // Calculate exact overlaps between consecutive chunks
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) {
      const prev = chunks[i - 1];
      const curr = chunks[i];
      // Overlap is the intersection of [prev.start, prev.end] and [curr.start, curr.end]
      const overlap = Math.max(0, prev.endChar - curr.startChar);
      curr.overlapWithPrev = overlap;
      prev.overlapWithNext = overlap;
    }
  }

  return chunks;
}
