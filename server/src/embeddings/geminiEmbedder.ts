import {
  IEmbeddingProvider,
  EmbeddingVectorResult,
  normalizeVector,
} from "./provider.js";

/**
 * Google Gemini Embedding Provider
 * Model: gemini-embedding-001 (Flexible 768 / 3072 Dimensions)
 *
 * Educational Concept:
 * Google's gemini-embedding-001 is a state-of-the-art multi-lingual embedding model
 * featuring Matryoshka Representation Learning (MRL).
 * Each text chunk is mapped into a continuous vector space (calibrated to 768 dimensions).
 * The model understands nuance, complex semantic relations, cross-lingual equivalents,
 * and technical jargon far beyond keyword matching.
 */
export class GeminiEmbedder implements IEmbeddingProvider {
  id = "gemini";
  name = "Google Gemini (gemini-embedding-001)";
  defaultModel = "gemini-embedding-001";
  defaultDimensions = 768;

  async embedText(
    text: string,
    options?: { apiKey?: string; model?: string },
  ): Promise<EmbeddingVectorResult> {
    const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Gemini API key is required. Please provide it in Settings or set GEMINI_API_KEY.",
      );
    }

    let model = options?.model || this.defaultModel;
    // Map retired text-embedding-004 to active gemini-embedding-001
    if (model === "text-embedding-004") {
      model = "gemini-embedding-001";
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

    const body: Record<string, any> = {
      content: {
        parts: [{ text }],
      },
    };

    if (model === "gemini-embedding-001") {
      body.outputDimensionality = 768;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawValues: number[] = data.embedding?.values;

    if (!rawValues || !Array.isArray(rawValues)) {
      throw new Error("Invalid response structure from Gemini API");
    }

    // Ensure normalized vector for consistent cosine calculations
    const normalized = normalizeVector(rawValues);

    return {
      embedding: normalized,
      dimensions: normalized.length,
      model,
      cached: false,
    };
  }

  async embedBatch(
    texts: string[],
    options?: { apiKey?: string; model?: string },
  ): Promise<EmbeddingVectorResult[]> {
    const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Gemini API key is required. Please provide it in Settings or set GEMINI_API_KEY.",
      );
    }

    let model = options?.model || this.defaultModel;
    // Map retired text-embedding-004 to active gemini-embedding-001
    if (model === "text-embedding-004") {
      model = "gemini-embedding-001";
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${apiKey}`;

    // Gemini batch endpoint accepts up to 100 requests per call
    const requests = texts.map((t) => {
      const req: Record<string, any> = {
        model: `models/${model}`,
        content: { parts: [{ text: t }] },
      };
      if (model === "gemini-embedding-001") {
        req.outputDimensionality = 768;
      }
      return req;
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      // Fallback to sequential if batch not supported on this endpoint
      return Promise.all(texts.map((t) => this.embedText(t, options)));
    }

    const data = await response.json();
    const embeddingsData = data.embeddings;

    if (!embeddingsData || !Array.isArray(embeddingsData)) {
      return Promise.all(texts.map((t) => this.embedText(t, options)));
    }

    return embeddingsData.map((item: any) => {
      const normalized = normalizeVector(item.values);
      return {
        embedding: normalized,
        dimensions: normalized.length,
        model,
        cached: false,
      };
    });
  }
}
