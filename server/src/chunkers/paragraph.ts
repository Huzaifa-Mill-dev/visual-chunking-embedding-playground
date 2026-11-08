import { ChunkRecord, ChunkOptions } from '../types.js';

/**
 * STRATEGY: Paragraph-Based Chunking
 * 
 * Educational Concept:
 * In well-structured writing (essays, documentation, news, academic papers),
 * each paragraph represents a single coherent thought, argument, or topic.
 * 
 * How it works:
 * - Detects paragraph boundaries using consecutive newlines (\n\n+).
 * - Treats each paragraph as a natural semantic unit.
 * - If a paragraph is shorter than `minChunkLength`, it can be merged with the next
 *   paragraph to avoid tiny, context-starved fragments.
 * - If a paragraph is longer than `chunkSize`, it is either kept intact (respecting
 *   author boundaries) or split if strictly required.
 * 
 * Trade-offs:
 * - Highly natural semantic cohesion.
 * - Chunks have variable, uneven lengths (some 100 chars, some 800 chars).
 * - Poor for unstructured text or logs with inconsistent formatting.
 */
export function chunkParagraph(
  docId: string,
  content: string,
  options: ChunkOptions
): ChunkRecord[] {
  const targetSize = Math.max(100, options.chunkSize || 400);
  const minLength = options.minChunkLength || 60;

  // Match paragraph blocks and capture their offsets in the original text
  const regex = /[^\r\n]+(?:\r?\n(?![ \t]*\r?\n)[^\r\n]+)*/g;
  const rawParagraphs: { text: string; start: number; end: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const text = match[0].trim();
    if (text.length > 0) {
      rawParagraphs.push({
        text,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  if (rawParagraphs.length === 0) {
    // Fallback if no clean paragraphs found
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

  // Group small paragraphs together until reaching targetSize
  const chunks: ChunkRecord[] = [];
  let currentGroup: { text: string; start: number; end: number }[] = [];
  let currentLength = 0;
  let chunkIndex = 0;

  function pushChunk(group: typeof currentGroup) {
    if (group.length === 0) return;
    const startChar = group[0].start;
    const endChar = group[group.length - 1].end;
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
  }

  for (const p of rawParagraphs) {
    if (currentGroup.length > 0 && currentLength + p.text.length > targetSize && currentLength >= minLength) {
      pushChunk(currentGroup);
      currentGroup = [p];
      currentLength = p.text.length;
    } else {
      currentGroup.push(p);
      currentLength += p.text.length;
    }
  }

  if (currentGroup.length > 0) {
    pushChunk(currentGroup);
  }

  // Calculate overlaps (paragraphs typically do not overlap, but we calculate cleanly)
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
