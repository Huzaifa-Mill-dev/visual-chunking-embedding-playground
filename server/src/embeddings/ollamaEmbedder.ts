import {
  IEmbeddingProvider,
  EmbeddingVectorResult,
  normalizeVector,
} from "./provider.js";

/**
 * Ollama Local Embedding Provider
 * Default Model: nomic-embed-text (768 Dimensions) or all-minilm (384 Dimensions)
 */
export class OllamaEmbedder implements IEmbeddingProvider {
  id = "ollama";
  name = "Ollama (Local Models)";
  defaultModel = "nomic-embed-text";
  defaultDimensions = 768;

  async embedText(
    text: string,
    options?: { endpoint?: string; model?: string },
  ): Promise<EmbeddingVectorResult> {
    const endpoint =
      options?.endpoint ||
      process.env.OLLAMA_ENDPOINT ||
      "http://localhost:11434";
    const model = options?.model || this.defaultModel;

    const response = await fetch(`${endpoint}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: text }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Ollama connection error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const rawValues: number[] = data.embedding;
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
    options?: { endpoint?: string; model?: string },
  ): Promise<EmbeddingVectorResult[]> {
    return Promise.all(texts.map((t) => this.embedText(t, options)));
  }
}
