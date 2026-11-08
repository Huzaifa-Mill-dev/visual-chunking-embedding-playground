import { SAMPLE_DOCUMENTS } from './src/sampleDocs/index.js';
import { chunkDocument, STRATEGY_CATALOG } from './src/chunkers/index.js';
import { EducationalEmbedder } from './src/embeddings/educationalEmbedder.js';
import { calculateCosineSimilarityWithTelemetry, rankChunksBySimilarity } from './src/similarity/cosine.js';
import { computePCA2D } from './src/similarity/pca.js';
import { EmbeddingCache } from './src/embeddings/cache.js';

console.log('=== RUNNING COMPREHENSIVE PLAYGROUND TEST SUITE ===\n');

// 1. Verify Sample Documents
console.log('1. Checking Sample Documents...');
if (SAMPLE_DOCUMENTS.length !== 4) {
  throw new Error(`Expected 4 sample documents, got ${SAMPLE_DOCUMENTS.length}`);
}
console.log(`✓ Found ${SAMPLE_DOCUMENTS.length} sample documents:`);
SAMPLE_DOCUMENTS.forEach(d => console.log(`  - ${d.title} (${d.charCount} chars, ${d.wordCount} words)`));

// 2. Test All Chunking Strategies
console.log('\n2. Testing Chunking Strategies...');
const testDoc = SAMPLE_DOCUMENTS[0]; // RAG Overview
const strategies = ['fixed', 'fixed-overlap', 'recursive', 'paragraph', 'sentence'] as const;

for (const strat of strategies) {
  const options = {
    strategy: strat,
    chunkSize: 300,
    chunkOverlap: 40,
  };
  const chunks = chunkDocument(testDoc.id, testDoc.content, options);
  console.log(`✓ Strategy [${strat}]: Generated ${chunks.length} chunks.`);

  // Verify boundaries
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    if (c.startChar < 0 || c.endChar > testDoc.content.length || c.startChar > c.endChar) {
      throw new Error(`Invalid boundary for chunk #${i} in ${strat}: [${c.startChar}, ${c.endChar}]`);
    }
    const extracted = testDoc.content.slice(c.startChar, c.endChar);
    if (extracted !== c.text) {
      throw new Error(`Extracted text does not match source content for chunk #${i} in ${strat}`);
    }
  }

  if (strat === 'fixed-overlap') {
    const overlappingChunks = chunks.filter(c => c.overlapWithPrev > 0);
    console.log(`  - Overlapping chunks: ${overlappingChunks.length} / ${chunks.length}`);
    if (overlappingChunks.length === 0) {
      throw new Error('Expected overlapping chunks in fixed-overlap strategy');
    }
  }
}

// 3. Test Educational Embedding Engine
console.log('\n3. Testing Educational Vectorizer...');
const embedder = new EducationalEmbedder();
const testChunks = chunkDocument(testDoc.id, testDoc.content, {
  strategy: 'recursive',
  chunkSize: 350,
  chunkOverlap: 50,
});

const embedPromises = testChunks.map(c => embedder.embedText(c.text));
const embedResults = await Promise.all(embedPromises);

for (let i = 0; i < testChunks.length; i++) {
  testChunks[i].embedding = embedResults[i].embedding;
  testChunks[i].dimensions = embedResults[i].dimensions;
  testChunks[i].model = embedResults[i].model;

  if (testChunks[i].embedding.length !== 64) {
    throw new Error(`Expected 64 dimensions, got ${testChunks[i].embedding.length}`);
  }
}
console.log(`✓ Successfully generated embeddings for ${testChunks.length} chunks (64 dimensions each).`);

// 4. Test Cosine Similarity & Semantic Search
console.log('\n4. Testing Cosine Similarity & Semantic Search...');
const query = 'Why do we need to split documents into smaller pieces?';
const queryVectorResult = await embedder.embedText(query);

const searchResults = rankChunksBySimilarity(queryVectorResult.embedding, testChunks);
console.log(`✓ Semantic Search Query: "${query}"`);
console.log(`  Top 3 Ranked Matches:`);
searchResults.slice(0, 3).forEach((r, rank) => {
  console.log(`  #${rank + 1} Chunk #${r.chunkIndex} (Cosine: ${r.rawCosine.toFixed(4)}, Angle: ${r.angleDegrees.toFixed(1)}°): "${r.text.slice(0, 60)}..."`);
});

const topTelemetry = calculateCosineSimilarityWithTelemetry(queryVectorResult.embedding, testChunks[searchResults[0].chunkIndex].embedding!);
console.log(`  Top Match Telemetry: DotProduct=${topTelemetry.dotProduct.toFixed(4)}, Angle=${topTelemetry.angleDegrees.toFixed(2)}°`);
console.log(`  Geometric interpretation: ${topTelemetry.geometricInterpretation}`);

// 5. Test PCA 2D Dimensionality Reduction
console.log('\n5. Testing PCA 2D Projection...');
const pcaResult = computePCA2D(testChunks);
console.log(`✓ PCA computed ${pcaResult.points.length} 2D points.`);
console.log(`  PC1 Variance: ${(pcaResult.explainedVarianceRatio[0] * 100).toFixed(1)}%`);
console.log(`  PC2 Variance: ${(pcaResult.explainedVarianceRatio[1] * 100).toFixed(1)}%`);
console.log(`  ${pcaResult.educationalNote}`);

// 6. Test Embedding Cache
console.log('\n6. Testing Hash-Based Embedding Cache...');
const cache = new EmbeddingCache('./data');
cache.set('educational', 'test-model', 'sample text', embedResults[0]);
const retrieved = cache.get('educational', 'test-model', 'sample text');
if (!retrieved || retrieved.embedding.length !== 64) {
  throw new Error('Cache retrieval failed');
}
console.log(`✓ Cache successfully stored and retrieved embedding vector.`);

console.log('\n=== ALL 6 TEST SUITES PASSED SUCCESSFULLY! ===\n');
