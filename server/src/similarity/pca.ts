import { ChunkRecord, PCAProjection } from "../types.js";

export interface PCAResult {
  points: PCAProjection[];
  explainedVarianceRatio: [number, number]; // [PC1 variance %, PC2 variance %]
  educationalNote: string;
}

/**
 * Principal Component Analysis (PCA) 2D Projection
 *
 * Educational Concept:
 * Real embeddings live in high-dimensional space (e.g. 64-D, 768-D, 1536-D).
 * Humans cannot visualize geometry beyond 3 dimensions.
 *
 * PCA is a mathematical technique that finds the directions (Principal Components)
 * of MAXIMUM VARIANCE in the data cloud.
 *
 * - Principal Component 1 (PC1): The axis along which the data varies the most.
 * - Principal Component 2 (PC2): The axis orthogonal to PC1 with the second-highest variance.
 *
 * Important Educational Caveat:
 * A 2D projection compresses high-dimensional geometry. Distances in 2D give intuition
 * about clusters and neighborhoods, but do not capture 100% of the true high-dimensional distance.
 */
export function computePCA2D(chunks: ChunkRecord[]): PCAResult {
  const validChunks = chunks.filter(
    (c) => c.embedding && c.embedding.length > 0,
  );

  if (validChunks.length < 2) {
    return {
      points: validChunks.map((c) => ({
        chunkId: c.id,
        chunkIndex: c.index,
        x: 0,
        y: 0,
        text: c.text,
      })),
      explainedVarianceRatio: [1.0, 0.0],
      educationalNote:
        "Need at least 2 embedded chunks to compute Principal Component projection.",
    };
  }

  const N = validChunks.length;
  const D = validChunks[0].embedding!.length;

  // 1. Compute Mean Vector across all chunks
  const mean = new Array(D).fill(0);
  for (let i = 0; i < N; i++) {
    const vec = validChunks[i].embedding!;
    for (let d = 0; d < D; d++) {
      mean[d] += vec[d];
    }
  }
  for (let d = 0; d < D; d++) {
    mean[d] /= N;
  }

  // 2. Center the vectors (subtract mean)
  const centered: number[][] = [];
  for (let i = 0; i < N; i++) {
    const vec = validChunks[i].embedding!;
    const row = new Array(D);
    for (let d = 0; d < D; d++) {
      row[d] = vec[d] - mean[d];
    }
    centered.push(row);
  }

  // 3. Power Iteration to find Principal Component 1 (eigenvector of X^T * X)
  function powerIteration(
    data: number[][],
    deflatedVector?: number[],
    numIterations = 30,
  ): { vector: number[]; eigenvalue: number } {
    let v = new Array(D).fill(0).map((_, idx) => Math.sin(idx + 1));
    // Normalize initial vector
    let vNorm = Math.sqrt(v.reduce((acc, val) => acc + val * val, 0));
    v = v.map((val) => val / vNorm);

    for (let iter = 0; iter < numIterations; iter++) {
      // If deflating against PC1, ensure orthogonality (Gram-Schmidt)
      if (deflatedVector) {
        let dot = 0;
        for (let d = 0; d < D; d++) dot += v[d] * deflatedVector[d];
        for (let d = 0; d < D; d++) v[d] -= dot * deflatedVector[d];
      }

      // Compute w = X^T * (X * v)
      // First: temp = X * v (length N)
      const temp = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        for (let d = 0; d < D; d++) {
          temp[i] += data[i][d] * v[d];
        }
      }

      // Second: w = X^T * temp (length D)
      const w = new Array(D).fill(0);
      for (let d = 0; d < D; d++) {
        for (let i = 0; i < N; i++) {
          w[d] += data[i][d] * temp[i];
        }
      }

      // Normalize w
      const norm = Math.sqrt(w.reduce((acc, val) => acc + val * val, 0));
      if (norm === 0) break;
      v = w.map((val) => val / norm);
    }

    // Eigenvalue is v^T * (X^T * X) * v = ||X * v||^2
    let eigenvalue = 0;
    for (let i = 0; i < N; i++) {
      let projection = 0;
      for (let d = 0; d < D; d++) projection += data[i][d] * v[d];
      eigenvalue += projection * projection;
    }

    return { vector: v, eigenvalue };
  }

  // Find PC1
  const pc1 = powerIteration(centered);
  // Find PC2 (orthogonal to PC1)
  const pc2 = powerIteration(centered, pc1.vector);

  // Compute total variance (sum of squared norms of centered data)
  let totalVariance = 0;
  for (let i = 0; i < N; i++) {
    for (let d = 0; d < D; d++) {
      totalVariance += centered[i][d] * centered[i][d];
    }
  }

  const var1 = totalVariance > 0 ? pc1.eigenvalue / totalVariance : 0.5;
  const var2 = totalVariance > 0 ? pc2.eigenvalue / totalVariance : 0.3;

  // Project data onto PC1 and PC2
  const rawCoords: { x: number; y: number; chunk: ChunkRecord }[] = [];
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (let i = 0; i < N; i++) {
    let x = 0;
    let y = 0;
    for (let d = 0; d < D; d++) {
      x += centered[i][d] * pc1.vector[d];
      y += centered[i][d] * pc2.vector[d];
    }
    rawCoords.push({ x, y, chunk: validChunks[i] });
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  // Normalize coordinates to [-1, 1] range for visual convenience
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const points: PCAProjection[] = rawCoords.map((item) => ({
    chunkId: item.chunk.id,
    chunkIndex: item.chunk.index,
    x: ((item.x - minX) / spanX) * 2 - 1,
    y: ((item.y - minY) / spanY) * 2 - 1,
    text: item.chunk.text,
  }));

  return {
    points,
    explainedVarianceRatio: [
      Math.min(1, Math.max(0, var1)),
      Math.min(1, Math.max(0, var2)),
    ],
    educationalNote: `PC1 captures ${(var1 * 100).toFixed(1)}% of total variance, and PC2 captures ${(var2 * 100).toFixed(1)}%. Together, this 2D plane preserves ${((var1 + var2) * 100).toFixed(1)}% of the original ${D}-dimensional geometry.`,
  };
}
