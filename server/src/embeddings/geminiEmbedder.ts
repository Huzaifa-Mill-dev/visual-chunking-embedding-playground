import { IEmbeddingProvider, EmbeddingVectorResult, normalizeVector } from './provider.js';

/**
 * Google Gemini Embedding Provider
 * Model: text-embedding-004 (768 Dimensions)
 * 
 * Educational Concept:
 * Google's text-embedding-004 is a state-of-the-art multi-lingual embedding model.
 * Each text chunk is mapped into a 768-dimensional continuous vector space.
 * The model understands nuance, complex semantic relations, cross-lingual equivalents,
 * and technical jargon far beyond keyword matching.
 */
export class GeminiEmbedder implements IEmbeddingProvider {
  id = 'gemini';
  name = 'Google Gemini (text-embedding-004)';
  defaultModel = 'text-embedding-004';
  defaultDimensions = 768;

  async embedText(text: string, options?: { apiKey?: string; model?: string }): Promise<EmbeddingVectorResult> {
    const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is required. Please provide it in Settings or set GEMINI_API_KEY.');
    }

    const model = options?.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: {
          parts: [{ text }],
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawValues: number[] = data.embedding?.values;

    if (!rawValues || !Array.isArray(rawValues)) {
      throw new Error('Invalid response structure from Gemini API');
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

  async embedBatch(texts: string[], options?: { apiKey?: string; model?: string }): Promise<EmbeddingVectorResult[]> {
    const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is required. Please provide it in Settings or set GEMINI_API_KEY.');
    }

    const model = options?.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${apiKey}`;

    // Gemini batch endpoint accepts up to 100 requests per call
    const requests = texts.map(t => ({
      model: `models/${model}`,
      content: { parts: [{ text: t }] },
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      // Fallback to sequential if batch not supported on this endpoint
      return Promise.all(texts.map(t => this.embedText(t, options)));
    }

    const data = await response.json();
    const embeddingsData = data.embeddings;

    if (!embeddingsData || !Array.isArray(embeddingsData)) {
      return Promise.all(texts.map(t => this.embedText(t, options)));
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
