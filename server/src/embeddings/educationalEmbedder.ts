import { IEmbeddingProvider, EmbeddingVectorResult, normalizeVector } from './provider.js';

/**
 * Educational Built-in Semantic Embedder (64 Dimensions)
 * 
 * Educational Concept:
 * Real neural embedding models (like Gemini text-embedding-004 or BERT) pass text
 * through deep Transformer layers to compress semantic meaning into a continuous
 * geometric vector space where related ideas point in similar directions.
 * 
 * To allow zero-friction experimentation without requiring paid API keys, this
 * educational embedder projects text into a calibrated 64-dimensional dense vector space:
 * 
 * 1. Semantic Concept Anchors (Dimensions 0-31):
 *    Maps domain vocabulary (e.g. biology, photosynthesis, algorithms, distributed systems,
 *    neural networks, retrieval, storage) onto clustered sub-dimensions.
 * 2. Positional N-Gram Syntactic Projections (Dimensions 32-63):
 *    Uses Murmur-style hash functions across word pairs to capture phrase composition.
 * 3. Unit Normalization:
 *    The resulting vector is L2-normalized onto the 64-dimensional unit hypersphere.
 * 
 * Result:
 * Two sentences expressing the same concept using different words will have high cosine
 * similarity, demonstrating the core principle of semantic embeddings!
 */
export class EducationalEmbedder implements IEmbeddingProvider {
  id = 'educational';
  name = 'Educational Dense Vectorizer (Local 64-D)';
  defaultModel = 'educational-semantic-64';
  defaultDimensions = 64;

  // Semantic concept clusters mapped to specific vector dimensions
  private conceptClusters: { keywords: string[]; dimensions: number[]; weight: number }[] = [
    {
      keywords: ['rag', 'retrieval', 'augmented', 'generation', 'chunk', 'chunking', 'vector', 'database', 'embedding', 'search'],
      dimensions: [0, 1, 2, 3, 4],
      weight: 3.5,
    },
    {
      keywords: ['photo', 'photosynthesis', 'plant', 'sunlight', 'chlorophyll', 'chloroplast', 'atp', 'glucose', 'light', 'energy', 'solar'],
      dimensions: [5, 6, 7, 8, 9],
      weight: 3.5,
    },
    {
      keywords: ['distributed', 'systems', 'cap', 'theorem', 'consistency', 'availability', 'partition', 'replication', 'node', 'cluster', 'database'],
      dimensions: [10, 11, 12, 13, 14],
      weight: 3.5,
    },
    {
      keywords: ['ai', 'agent', 'model', 'llm', 'transformer', 'neural', 'prompt', 'reasoning', 'autonomous', 'tool'],
      dimensions: [15, 16, 17, 18, 19],
      weight: 3.5,
    },
    {
      keywords: ['memory', 'state', 'cache', 'storage', 'disk', 'persistence', 'index', 'query', 'latency'],
      dimensions: [20, 21, 22, 23],
      weight: 2.8,
    },
    {
      keywords: ['algorithm', 'compute', 'complexity', 'logic', 'function', 'execution', 'pipeline', 'process'],
      dimensions: [24, 25, 26, 27],
      weight: 2.5,
    },
    {
      keywords: ['text', 'document', 'token', 'word', 'character', 'sentence', 'paragraph', 'syntax', 'language'],
      dimensions: [28, 29, 30, 31],
      weight: 2.5,
    },
  ];

  async embedText(text: string): Promise<EmbeddingVectorResult> {
    const rawVector = new Array(this.defaultDimensions).fill(0.01);
    const cleaned = text.toLowerCase();
    const words = cleaned.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);

    // 1. Semantic Concept Matching
    for (const cluster of this.conceptClusters) {
      for (const kw of cluster.keywords) {
        if (cleaned.includes(kw)) {
          for (const dim of cluster.dimensions) {
            rawVector[dim] += cluster.weight * (1 + 0.3 * Math.sin(dim * 1.5));
          }
        }
      }
    }

    // 2. Word-level frequency and hash projection (Distributed Representation)
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }

      // Distribute hash over dimensions
      const targetDim = Math.abs(hash) % this.defaultDimensions;
      const sign = (hash & 1) === 0 ? 1 : -1;
      rawVector[targetDim] += sign * (0.8 + 0.4 * Math.cos(targetDim));

      // Bigram projection
      if (i > 0) {
        const bigram = words[i - 1] + '_' + word;
        let bHash = 5381;
        for (let j = 0; j < bigram.length; j++) {
          bHash = ((bHash << 5) + bHash) + bigram.charCodeAt(j);
          bHash |= 0;
        }
        const bDim = Math.abs(bHash) % this.defaultDimensions;
        rawVector[bDim] += 0.5 * Math.sin(bDim);
      }
    }

    // 3. Document length influence
    const lengthFactor = Math.log1p(text.length) / 10;
    rawVector[63] += lengthFactor * 0.5;

    // 4. L2 Normalization
    const normalized = normalizeVector(rawVector);

    return {
      embedding: normalized,
      dimensions: this.defaultDimensions,
      model: this.defaultModel,
      cached: false,
    };
  }

  async embedBatch(texts: string[]): Promise<EmbeddingVectorResult[]> {
    return Promise.all(texts.map(t => this.embedText(t)));
  }
}
