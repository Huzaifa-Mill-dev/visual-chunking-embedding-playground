import { IEmbeddingProvider, EmbeddingVectorResult, normalizeVector } from './provider.js';

/**
 * OpenAI Embedding Provider
 * Model: text-embedding-3-small (1536 Dimensions)
 */
export class OpenAIEmbedder implements IEmbeddingProvider {
  id = 'openai';
  name = 'OpenAI (text-embedding-3-small)';
  defaultModel = 'text-embedding-3-small';
  defaultDimensions = 1536;

  async embedText(text: string, options?: { apiKey?: string; model?: string }): Promise<EmbeddingVectorResult> {
    const results = await this.embedBatch([text], options);
    return results[0];
  }

  async embedBatch(texts: string[], options?: { apiKey?: string; model?: string }): Promise<EmbeddingVectorResult[]> {
    const apiKey = options?.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Please provide it in Settings or set OPENAI_API_KEY.');
    }

    const model = options?.model || this.defaultModel;
    const url = 'https://api.openai.com/v1/embeddings';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: texts,
        model,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const items = data.data;

    return items.map((item: any) => {
      const normalized = normalizeVector(item.embedding);
      return {
        embedding: normalized,
        dimensions: normalized.length,
        model,
        cached: false,
      };
    });
  }
}
