import { ChunkRecord, ChunkOptions, ChunkStrategy } from '../types.js';
import { chunkFixed } from './fixed.js';
import { chunkFixedOverlap } from './fixedOverlap.js';
import { chunkRecursive } from './recursive.js';
import { chunkParagraph } from './paragraph.js';
import { chunkSentence } from './sentence.js';

export interface StrategyInfo {
  id: ChunkStrategy;
  name: string;
  tagline: string;
  description: string;
  howItWorks: string[];
  pros: string[];
  cons: string[];
  recommendedFor: string;
}

export const STRATEGY_CATALOG: Record<ChunkStrategy, StrategyInfo> = {
  fixed: {
    id: 'fixed',
    name: 'Fixed Character Chunking',
    tagline: 'Rigid character windows with no overlap',
    description: 'Divides the document into exact, uniform character lengths without considering words, punctuation, or paragraph breaks.',
    howItWorks: [
      'Sets a pointer at character 0.',
      'Slices exactly chunkSize characters forward.',
      'Advances pointer by chunkSize with zero overlap.',
      'Repeats until end of document is reached.'
    ],
    pros: [
      'Extremely fast and deterministic O(N).',
      'Guarantees uniform chunk lengths.',
      'Zero redundancy (no duplicate text stored).'
    ],
    cons: [
      'Splits words in half (e.g. "comput" / "ation").',
      'Breaks sentences across chunks, destroying context.',
      'Poor retrieval accuracy for semantic search.'
    ],
    recommendedFor: 'Baseline benchmarking and understanding what happens when no boundary awareness exists.'
  },
  'fixed-overlap': {
    id: 'fixed-overlap',
    name: 'Fixed-Size with Overlap (Sliding Window)',
    tagline: 'Fixed character windows with overlapping margins',
    description: 'Steps forward by (chunkSize - chunkOverlap), ensuring that text near boundaries appears in two consecutive chunks.',
    howItWorks: [
      'Slices window of chunkSize from current pointer.',
      'Advances pointer forward by (chunkSize - chunkOverlap) characters.',
      'Boundary text is duplicated into both chunks so continuity is never broken.',
      'Calculates overlap intersection between adjacent chunks.'
    ],
    pros: [
      'Prevents loss of facts spanning across chunk seams.',
      'Guarantees every phrase near boundary is captured.',
      'Simple sliding window concept.'
    ],
    cons: [
      'Duplicates text, increasing chunk count, API token costs, and vector storage.',
      'Still splits words if boundary lands mid-word.',
      'Redundant retrieval results if both overlapping chunks match.'
    ],
    recommendedFor: 'Simple streams, fixed-length context windows, or time-series text.'
  },
  recursive: {
    id: 'recursive',
    name: 'Recursive Character Splitting',
    tagline: 'Standard RAG algorithm: Paragraphs → Lines → Sentences → Words',
    description: 'The golden standard in modern RAG frameworks. Tries natural separators in priority order to keep semantic units together.',
    howItWorks: [
      'Attempts to split by double newline (\\n\\n) to preserve paragraphs.',
      'If a paragraph exceeds chunkSize, recurses using single newlines (\\n).',
      'If still too large, recurses using sentence endings (. ), then spaces ( ).',
      'Recombines adjacent small pieces up to chunkSize while maintaining chunkOverlap.'
    ],
    pros: [
      'Preserves paragraph and sentence integrity whenever possible.',
      'Minimizes word breakage and fragmented syntax.',
      'Significantly higher retrieval precision in RAG systems.'
    ],
    cons: [
      'Slightly more complex execution logic.',
      'Chunk sizes vary slightly based on natural split points.'
    ],
    recommendedFor: 'General documentation, articles, Markdown files, and production RAG pipelines.'
  },
  paragraph: {
    id: 'paragraph',
    name: 'Paragraph-Based Chunking',
    tagline: 'Natural document structure by paragraph units',
    description: 'Splits on paragraph boundaries (consecutive newlines), treating each paragraph as an autonomous thought unit.',
    howItWorks: [
      'Scans document for paragraph breaks (\\n\\n+).',
      'Merges tiny paragraphs (< minLength) to prevent context starvation.',
      'Preserves original paragraph flow without splitting sentences.'
    ],
    pros: [
      'Maximizes semantic cohesion of arguments and narrative.',
      'Matches human reading and author structure.',
      'Clean boundaries with zero mid-word cuts.'
    ],
    cons: [
      'Chunk lengths can be highly uneven (short headers vs massive essays).',
      'Does not work well on unformatted single-line text or code dumps.'
    ],
    recommendedFor: 'Academic papers, essays, blogs, news articles, and legal documents.'
  },
  sentence: {
    id: 'sentence',
    name: 'Sentence-Based Chunking',
    tagline: 'Grammatical proposition units with sentence overlap',
    description: 'Splits on grammatical sentence endings (.!?) and packs complete sentences up to chunkSize with sentence-level overlap.',
    howItWorks: [
      'Detects sentence boundaries using terminal punctuation.',
      'Gathers complete sentences into a chunk up to chunkSize.',
      'Retains trailing sentences as overlap for the subsequent chunk.',
      'Never slices through a sentence or word.'
    ],
    pros: [
      'Every chunk contains grammatically complete propositions.',
      'Maintains clean subject-predicate syntax for embedding models.',
      'Fine-grained control over statement-level context.'
    ],
    cons: [
      'Sentence boundary detection can misinterpret abbreviations (e.g., "Dr.", "e.g.").',
      'Slightly higher compute for sentence regex tokenization.'
    ],
    recommendedFor: 'FAQ documents, technical manuals, transcripts, and dialog logs.'
  }
};

export function chunkDocument(
  docId: string,
  content: string,
  options: ChunkOptions
): ChunkRecord[] {
  switch (options.strategy) {
    case 'fixed':
      return chunkFixed(docId, content, options);
    case 'fixed-overlap':
      return chunkFixedOverlap(docId, content, options);
    case 'recursive':
      return chunkRecursive(docId, content, options);
    case 'paragraph':
      return chunkParagraph(docId, content, options);
    case 'sentence':
      return chunkSentence(docId, content, options);
    default:
      return chunkRecursive(docId, content, options);
  }
}
