import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { JsonDatabase } from "./storage/db.js";
import { SAMPLE_DOCUMENTS } from "./sampleDocs/index.js";
import { STRATEGY_CATALOG, chunkDocument } from "./chunkers/index.js";
import { ChunkOptions, DocumentRecord, ChunkRecord } from "./types.js";

import { EducationalEmbedder } from "./embeddings/educationalEmbedder.js";
import { GeminiEmbedder } from "./embeddings/geminiEmbedder.js";
import { OpenAIEmbedder } from "./embeddings/openaiEmbedder.js";
import { OllamaEmbedder } from "./embeddings/ollamaEmbedder.js";
import { EmbeddingCache } from "./embeddings/cache.js";
import {
  IEmbeddingProvider,
  computeVectorStats,
} from "./embeddings/provider.js";

import {
  calculateCosineSimilarityWithTelemetry,
  rankChunksBySimilarity,
} from "./similarity/cosine.js";
import { computePCA2D } from "./similarity/pca.js";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialize persistence & services
const db = new JsonDatabase("./data");
const cache = new EmbeddingCache("./data");

// Provider Registry
const providers: Record<string, IEmbeddingProvider> = {
  educational: new EducationalEmbedder(),
  gemini: new GeminiEmbedder(),
  openai: new OpenAIEmbedder(),
  ollama: new OllamaEmbedder(),
};

// Seed sample documents on first startup if empty
if (db.getAllDocuments().length === 0) {
  for (const doc of SAMPLE_DOCUMENTS) {
    db.saveDocument(doc);
    // Generate initial default chunks for sample doc
    const defaultOptions: ChunkOptions = {
      strategy: "recursive",
      chunkSize: 350,
      chunkOverlap: 50,
    };
    const chunks = chunkDocument(doc.id, doc.content, defaultOptions);
    db.saveDocChunks(doc.id, defaultOptions, chunks);
  }
}

// -------------------------------------------------------------
// ROUTES: Documents
// -------------------------------------------------------------

app.get("/api/documents", (req, res) => {
  const docs = db.getAllDocuments();
  const activeId = db.getActiveDocId() || (docs.length > 0 ? docs[0].id : null);
  res.json({ documents: docs, activeId });
});

app.get("/api/documents/:id", (req, res) => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  const chunkData = db.getDocChunks(doc.id);
  res.json({
    document: doc,
    chunks: chunkData?.chunks || [],
    options: chunkData?.options || null,
  });
});

app.post("/api/documents", (req, res) => {
  const { title, filename, content, fileType } = req.body;
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Content is required" });
  }

  const id =
    "doc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const trimmed = content.trim();
  const doc: DocumentRecord = {
    id,
    title: title || filename || "Untitled Document",
    filename: filename || "document.txt",
    fileType: fileType || (filename?.endsWith(".md") ? "md" : "txt"),
    content,
    charCount: content.length,
    wordCount: trimmed.length > 0 ? trimmed.split(/\s+/).length : 0,
    lineCount: content.split("\n").length,
    createdAt: new Date().toISOString(),
  };

  db.saveDocument(doc);

  // Automatically chunk with recursive default
  const defaultOptions: ChunkOptions = {
    strategy: "recursive",
    chunkSize: 350,
    chunkOverlap: 50,
  };
  const chunks = chunkDocument(doc.id, doc.content, defaultOptions);
  db.saveDocChunks(doc.id, defaultOptions, chunks);

  res.json({ document: doc, chunks, options: defaultOptions });
});

app.delete("/api/documents/:id", (req, res) => {
  db.deleteDocument(req.params.id);
  res.json({ success: true });
});

app.post("/api/documents/reset-samples", (req, res) => {
  for (const doc of SAMPLE_DOCUMENTS) {
    db.saveDocument(doc);
    const defaultOptions: ChunkOptions = {
      strategy: "recursive",
      chunkSize: 350,
      chunkOverlap: 50,
    };
    const chunks = chunkDocument(doc.id, doc.content, defaultOptions);
    db.saveDocChunks(doc.id, defaultOptions, chunks);
  }
  res.json({ success: true, count: SAMPLE_DOCUMENTS.length });
});

// -------------------------------------------------------------
// ROUTES: Chunking
// -------------------------------------------------------------

app.get("/api/strategies", (req, res) => {
  res.json({ strategies: STRATEGY_CATALOG });
});

app.post("/api/chunk", (req, res) => {
  const { docId, options } = req.body as {
    docId: string;
    options: ChunkOptions;
  };
  if (!docId) {
    return res.status(400).json({ error: "docId is required" });
  }

  const doc = db.getDocument(docId);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }

  const chunks = chunkDocument(doc.id, doc.content, options);

  // Check if any chunks match existing cache for embeddings
  const provider = providers.educational;
  for (const c of chunks) {
    const cached = cache.get("educational", provider.defaultModel, c.text);
    if (cached) {
      c.embedding = cached.embedding;
      c.model = cached.model;
      c.dimensions = cached.dimensions;
    }
  }

  db.saveDocChunks(doc.id, options, chunks);
  res.json({ chunks, options, count: chunks.length });
});

// -------------------------------------------------------------
// ROUTES: Embeddings
// -------------------------------------------------------------

app.post("/api/embed", async (req, res) => {
  try {
    const {
      docId,
      chunkIds,
      provider: providerName = "educational",
      model,
      apiKey,
      endpoint,
    } = req.body;

    if (!docId) {
      return res.status(400).json({ error: "docId is required" });
    }

    const docChunks = db.getDocChunks(docId);
    if (!docChunks) {
      return res.status(404).json({ error: "No chunks found for document" });
    }

    const provider = providers[providerName];
    if (!provider) {
      return res
        .status(400)
        .json({ error: `Unknown provider: ${providerName}` });
    }

    const effectiveApiKey = apiKey || req.headers["x-api-key"]?.toString();
    const targetChunks =
      chunkIds && Array.isArray(chunkIds)
        ? docChunks.chunks.filter((c) => chunkIds.includes(c.id))
        : docChunks.chunks;

    let newlyGeneratedCount = 0;
    let cachedCount = 0;

    for (const chunk of targetChunks) {
      // Check cache first
      const cached = cache.get(
        providerName,
        model || provider.defaultModel,
        chunk.text,
      );
      if (cached) {
        chunk.embedding = cached.embedding;
        chunk.model = cached.model;
        chunk.dimensions = cached.dimensions;
        chunk.embeddedAt = new Date().toISOString();
        cachedCount++;
      } else {
        const result = await provider.embedText(chunk.text, {
          apiKey: effectiveApiKey,
          model,
        });

        chunk.embedding = result.embedding;
        chunk.model = result.model;
        chunk.dimensions = result.dimensions;
        chunk.embeddedAt = new Date().toISOString();

        cache.set(providerName, result.model, chunk.text, result);
        newlyGeneratedCount++;
      }
    }

    // Persist updated chunks
    db.saveDocChunks(
      docId,
      docChunks.options || {
        strategy: "recursive",
        chunkSize: 350,
        chunkOverlap: 50,
      },
      docChunks.chunks,
    );

    // Compute stats on first embedded chunk as telemetry sample
    const sampleChunk = targetChunks.find((c) => c.embedding);
    const vectorStats = sampleChunk?.embedding
      ? computeVectorStats(sampleChunk.embedding)
      : null;

    res.json({
      success: true,
      totalProcessed: targetChunks.length,
      newlyGeneratedCount,
      cachedCount,
      chunks: docChunks.chunks,
      sampleStats: vectorStats,
    });
  } catch (err: any) {
    console.error("Embedding generation failed:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to generate embeddings" });
  }
});

// -------------------------------------------------------------
// ROUTES: Similarity & Semantic Search
// -------------------------------------------------------------

app.post("/api/search", async (req, res) => {
  try {
    const {
      docId,
      query,
      provider: providerName = "educational",
      model,
      apiKey,
    } = req.body;

    if (!docId || !query || typeof query !== "string") {
      return res.status(400).json({ error: "docId and query are required" });
    }

    const docChunks = db.getDocChunks(docId);
    if (!docChunks || docChunks.chunks.length === 0) {
      return res.status(400).json({ error: "No chunks available to search" });
    }

    const provider = providers[providerName] || providers.educational;
    const effectiveApiKey = apiKey || req.headers["x-api-key"]?.toString();

    // 1. Embed Query
    const queryResult = await provider.embedText(query, {
      apiKey: effectiveApiKey,
      model,
    });

    // 2. Rank chunks by Cosine Similarity
    const rankedResults = rankChunksBySimilarity(
      queryResult.embedding,
      docChunks.chunks,
    );

    // 3. Step-by-step breakdown for top match
    let topMatchExplanation = null;
    if (rankedResults.length > 0) {
      const topChunk = docChunks.chunks.find(
        (c) => c.id === rankedResults[0].chunkId,
      );
      if (topChunk?.embedding) {
        topMatchExplanation = calculateCosineSimilarityWithTelemetry(
          queryResult.embedding,
          topChunk.embedding,
        );
      }
    }

    const queryStats = computeVectorStats(queryResult.embedding);

    res.json({
      query,
      queryStats,
      rankedResults,
      topMatchExplanation,
      totalChunksQueried: docChunks.chunks.length,
    });
  } catch (err: any) {
    console.error("Search failed:", err);
    res.status(500).json({ error: err.message || "Search failed" });
  }
});

// -------------------------------------------------------------
// ROUTES: PCA 2D Dimensionality Reduction
// -------------------------------------------------------------

app.post("/api/pca", (req, res) => {
  try {
    const { docId } = req.body;
    if (!docId) {
      return res.status(400).json({ error: "docId is required" });
    }

    const docChunks = db.getDocChunks(docId);
    if (!docChunks || docChunks.chunks.length === 0) {
      return res.status(400).json({ error: "No chunks found" });
    }

    const pcaResult = computePCA2D(docChunks.chunks);
    res.json(pcaResult);
  } catch (err: any) {
    console.error("PCA failed:", err);
    res.status(500).json({ error: err.message || "PCA computation failed" });
  }
});

// -------------------------------------------------------------
// ROUTES: Compare Two Chunks
// -------------------------------------------------------------

app.post("/api/compare-chunks", (req, res) => {
  try {
    const { docId, chunkIdA, chunkIdB } = req.body;
    const docChunks = db.getDocChunks(docId);
    if (!docChunks)
      return res.status(404).json({ error: "Document chunks not found" });

    const chunkA = docChunks.chunks.find((c) => c.id === chunkIdA);
    const chunkB = docChunks.chunks.find((c) => c.id === chunkIdB);

    if (!chunkA || !chunkB) {
      return res.status(404).json({ error: "One or both chunks not found" });
    }

    if (!chunkA.embedding || !chunkB.embedding) {
      return res
        .status(400)
        .json({ error: "Both chunks must have embeddings generated first." });
    }

    const telemetry = calculateCosineSimilarityWithTelemetry(
      chunkA.embedding,
      chunkB.embedding,
    );
    res.json({
      chunkA: { id: chunkA.id, index: chunkA.index, text: chunkA.text },
      chunkB: { id: chunkB.id, index: chunkB.index, text: chunkB.text },
      telemetry,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Comparison failed" });
  }
});

// -------------------------------------------------------------
// ROUTES: Export JSON
// -------------------------------------------------------------

app.get("/api/export/:docId", (req, res) => {
  const doc = db.getDocument(req.params.docId);
  if (!doc) return res.status(404).json({ error: "Document not found" });

  const chunkData = db.getDocChunks(doc.id);
  const payload = {
    exportedAt: new Date().toISOString(),
    document: doc,
    chunkingConfiguration: chunkData?.options,
    chunks: chunkData?.chunks || [],
  };

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${doc.filename}-rag-export.json"`,
  );
  res.json(payload);
});

// Serve static frontend build if available
const distPath = path.resolve(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(
    `Educational Playground Server listening on http://localhost:${PORT}`,
  );
});
