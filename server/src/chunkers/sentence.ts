import { ChunkRecord, ChunkOptions } from '../types.js';

/**
 * STRATEGY: Sentence-Based Chunking
 * 
 * Educational Concept:
 * Sentences are the fundamental grammatical unit of a complete proposition or claim.
 * Splitting in the middle of a sentence harms embedding quality because the model
 * receives an incomplete syntactic structure (e.g., subject without verb).
 * 
 * How it works:
 * - Identifies sentence terminals (.!?) followed by spaces or newlines.
 * - Accumulates complete sentences until reaching `chunkSize`.
 * - Employs sentence-level overlap (e.g. keeping the last 1 or 2 sentences)
 *   rather than raw character overlap, preventing partial sentence truncations.
 */
export function chunkSentence(
  docId: string,
  content: string,
  options: ChunkOptions
): ChunkRecord[] {
  const chunkSize = Math.max(80, options.chunkSize || 300);
  const chunkOverlap = Math.max(0, Math.min(options.chunkOverlap || 50, chunkSize - 1));

  // Regex to split into sentences while preserving character positions
  const sentenceRegex = /[^.!?\r\n]+(?:[.!?]+["'\s]|(?=\r?\n|$))/g;
  const sentences: { text: string; start: number; end: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = sentenceRegex.exec(content)) !== null) {
    const text = match[0];
    if (text.trim().length > 0) {
      sentences.push({
        text,
        start: match.index,
        end: match.index + text.length,
      });
    }
  }

  if (sentences.length === 0) {
    return [{
      id: `${docId}_chunk_0`,
      docId,
      index: 0,
      text: content,
      startChar: 0,
      endChar: content.length,
      charCount: content.length,
      wordCount: content.trim().split(/\s+/).length,
      tokenCount: Math.max(1, Math.round(content.length / 4)),
      overlapWithPrev: 0,
      overlapWithNext: 0,
    }];
  }

  const chunks: ChunkRecord[] = [];
  let currentGroup: { text: string; start: number; end: number }[] = [];
  let currentLength = 0;
  let chunkIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sent = sentences[i];

    if (currentLength + sent.text.length > chunkSize && currentGroup.length > 0) {
      // Create chunk from current group
      const startChar = currentGroup[0].start;
      const endChar = currentGroup[currentGroup.length - 1].end;
      const chunkText = content.slice(startChar, endChar);

      chunks.push({
        id: `${docId}_chunk_${chunkIndex++}`,
        docId,
        index: chunks.length,
        text: chunkText,
        startChar,
        endChar,
        charCount: chunkText.length,
        wordCount: chunkText.trim().length > 0 ? chunkText.trim().split(/\s+/).length : 0,
        tokenCount: Math.max(1, Math.round(chunkText.length / 4)),
        overlapWithPrev: 0,
        overlapWithNext: 0,
      });

      // Retain sentences for overlap
      const retained: typeof currentGroup = [];
      let retainedLength = 0;

      for (let j = currentGroup.length - 1; j >= 0; j--) {
        const candidate = currentGroup[j];
        if (retainedLength + candidate.text.length <= chunkOverlap) {
          retained.unshift(candidate);
          retainedLength += candidate.text.length;
        } else {
          break;
        }
      }

      currentGroup = retained;
      currentLength = retainedLength;
    }

    currentGroup.push(sent);
    currentLength += sent.text.length;
  }

  if (currentGroup.length > 0) {
    const startChar = currentGroup[0].start;
    const endChar = currentGroup[currentGroup.length - 1].end;
    const chunkText = content.slice(startChar, endChar);

    chunks.push({
      id: `${docId}_chunk_${chunkIndex}`,
      docId,
      index: chunks.length,
      text: chunkText,
      startChar,
      endChar,
      charCount: chunkText.length,
      wordCount: chunkText.trim().length > 0 ? chunkText.trim().split(/\s+/).length : 0,
      tokenCount: Math.max(1, Math.round(chunkText.length / 4)),
      overlapWithPrev: 0,
      overlapWithNext: 0,
    });
  }

  // Calculate overlaps
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) {
      const prev = chunks[i - 1];
      const curr = chunks[i];
      const overlap = Math.max(0, prev.endChar - curr.startChar);
      curr.overlapWithPrev = overlap;
      prev.overlapWithNext = overlap;
    }
  }

  return chunks;
}
