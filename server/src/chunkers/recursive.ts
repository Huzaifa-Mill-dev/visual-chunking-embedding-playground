import { ChunkRecord, ChunkOptions } from "../types.js";

/**
 * STRATEGY: Recursive Character-Based Chunking
 *
 * Educational Concept:
 * The most popular chunking strategy in modern RAG (popularized by LangChain).
 * Instead of blind character counting, it tries to split on natural document boundaries:
 *
 * Priority hierarchy of separators:
 * 1. Double newlines ("\n\n") -> Paragraphs & Markdown headers
 * 2. Single newlines ("\n")   -> Lines & list items
 * 3. Period + space (". ")    -> Complete sentences
 * 4. Space (" ")              -> Words
 * 5. Empty string ("")        -> Individual characters (last resort)
 *
 * How it works:
 * - First attempts to split on the coarsest separator (paragraphs).
 * - If a paragraph is small enough to fit within `chunkSize`, it keeps it whole!
 * - If a paragraph exceeds `chunkSize`, it recursively breaks it down using the next
 *   separator (lines, sentences, then words) until all chunks satisfy `chunkSize`.
 * - Finally, it combines adjacent smaller pieces back together up to `chunkSize`
 *   while maintaining `chunkOverlap`.
 *
 * Strengths:
 * - Keeps semantically related sentences and thoughts together.
 * - Drastically improves vector retrieval accuracy compared to rigid character cuts.
 */
export function chunkRecursive(
  docId: string,
  content: string,
  options: ChunkOptions,
): ChunkRecord[] {
  const chunkSize = Math.max(50, options.chunkSize || 300);
  const chunkOverlap = Math.max(
    0,
    Math.min(options.chunkOverlap || 50, chunkSize - 1),
  );
  const separators =
    options.separators && options.separators.length > 0
      ? options.separators
      : ["\n\n", "\n", ". ", " ", ""];

  interface TextPiece {
    text: string;
    startChar: number;
    endChar: number;
  }

  // Recursive split function: splits text into small constituent pieces
  function splitTextRecursively(
    text: string,
    baseOffset: number,
    separatorIndex: number,
  ): TextPiece[] {
    if (text.length <= chunkSize || separatorIndex >= separators.length) {
      return [
        {
          text,
          startChar: baseOffset,
          endChar: baseOffset + text.length,
        },
      ];
    }

    const separator = separators[separatorIndex];
    let parts: string[];

    if (separator === "") {
      // Split character by character
      parts = Array.from(text);
    } else {
      parts = text.split(separator);
    }

    const resultPieces: TextPiece[] = [];
    let currentOffset = baseOffset;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      // Include the separator for natural spacing if not the last item
      const fullPart =
        i < parts.length - 1 && separator !== "" ? part + separator : part;

      if (fullPart.length > chunkSize) {
        // Recurse with finer separator
        const subPieces = splitTextRecursively(
          fullPart,
          currentOffset,
          separatorIndex + 1,
        );
        resultPieces.push(...subPieces);
      } else if (fullPart.length > 0) {
        resultPieces.push({
          text: fullPart,
          startChar: currentOffset,
          endChar: currentOffset + fullPart.length,
        });
      }

      currentOffset += fullPart.length;
    }

    return resultPieces;
  }

  const initialPieces = splitTextRecursively(content, 0, 0);

  // Now pack pieces into chunks respecting chunkSize and chunkOverlap
  const chunks: ChunkRecord[] = [];
  let currentPieces: TextPiece[] = [];
  let currentLength = 0;
  let chunkIndex = 0;

  for (let i = 0; i < initialPieces.length; i++) {
    const piece = initialPieces[i];

    // Check if adding this piece exceeds chunkSize
    if (
      currentLength + piece.text.length > chunkSize &&
      currentPieces.length > 0
    ) {
      // Finalize current chunk
      const startChar = currentPieces[0].startChar;
      const endChar = currentPieces[currentPieces.length - 1].endChar;
      const chunkText = content.slice(startChar, endChar);

      chunks.push({
        id: `${docId}_chunk_${chunkIndex++}`,
        docId,
        index: chunks.length,
        text: chunkText,
        startChar,
        endChar,
        charCount: chunkText.length,
        wordCount:
          chunkText.trim().length > 0
            ? chunkText.trim().split(/\s+/).length
            : 0,
        tokenCount: Math.max(1, Math.round(chunkText.length / 4)),
        overlapWithPrev: 0,
        overlapWithNext: 0,
      });

      // Prepare for next chunk with overlap:
      // Keep pieces from the end of currentPieces whose total length <= chunkOverlap
      const retainedPieces: TextPiece[] = [];
      let retainedLength = 0;

      for (let j = currentPieces.length - 1; j >= 0; j--) {
        const candidate = currentPieces[j];
        if (retainedLength + candidate.text.length <= chunkOverlap) {
          retainedPieces.unshift(candidate);
          retainedLength += candidate.text.length;
        } else {
          break;
        }
      }

      currentPieces = retainedPieces;
      currentLength = retainedLength;
    }

    currentPieces.push(piece);
    currentLength += piece.text.length;
  }

  // Final leftover chunk
  if (currentPieces.length > 0) {
    const startChar = currentPieces[0].startChar;
    const endChar = currentPieces[currentPieces.length - 1].endChar;
    const chunkText = content.slice(startChar, endChar);

    chunks.push({
      id: `${docId}_chunk_${chunkIndex}`,
      docId,
      index: chunks.length,
      text: chunkText,
      startChar,
      endChar,
      charCount: chunkText.length,
      wordCount:
        chunkText.trim().length > 0 ? chunkText.trim().split(/\s+/).length : 0,
      tokenCount: Math.max(1, Math.round(chunkText.length / 4)),
      overlapWithPrev: 0,
      overlapWithNext: 0,
    });
  }

  // Calculate overlaps between chunks
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
