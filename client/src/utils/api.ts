import { ChunkOptions, ChunkRecord, DocumentRecord, PCAResult, SimilarityResult, StrategyInfo } from '../types/index.js';

const API_BASE = '/api';

export interface ApiSettings {
  provider: 'educational' | 'gemini' | 'openai' | 'ollama';
  apiKey?: string;
  model?: string;
  endpoint?: string;
}

export const api = {
  async getDocuments(): Promise<{ documents: DocumentRecord[]; activeId: string | null }> {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error('Failed to load documents');
    return res.json();
  },

  async getDocument(id: string): Promise<{ document: DocumentRecord; chunks: ChunkRecord[]; options: ChunkOptions | null }> {
    const res = await fetch(`${API_BASE}/documents/${id}`);
    if (!res.ok) throw new Error('Failed to load document');
    return res.json();
  },

  async uploadDocument(data: { title: string; filename: string; content: string; fileType?: 'txt' | 'md' }): Promise<{ document: DocumentRecord; chunks: ChunkRecord[]; options: ChunkOptions }> {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  async resetSamples(): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/reset-samples`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset sample documents');
  },

  async getStrategies(): Promise<Record<string, StrategyInfo>> {
    const res = await fetch(`${API_BASE}/strategies`);
    if (!res.ok) throw new Error('Failed to fetch strategies');
    const data = await res.json();
    return data.strategies;
  },

  async chunkDocument(docId: string, options: ChunkOptions): Promise<{ chunks: ChunkRecord[]; options: ChunkOptions; count: number }> {
    const res = await fetch(`${API_BASE}/chunk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, options }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Chunking failed' }));
      throw new Error(err.error || 'Failed to chunk document');
    }
    return res.json();
  },

  async generateEmbeddings(
    docId: string,
    settings: ApiSettings,
    chunkIds?: string[]
  ): Promise<{
    success: boolean;
    totalProcessed: number;
    newlyGeneratedCount: number;
    cachedCount: number;
    chunks: ChunkRecord[];
    sampleStats: any;
  }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (settings.apiKey) {
      headers['x-api-key'] = settings.apiKey;
    }

    const res = await fetch(`${API_BASE}/embed`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        docId,
        chunkIds,
        provider: settings.provider,
        model: settings.model,
        apiKey: settings.apiKey,
        endpoint: settings.endpoint,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Embedding generation failed' }));
      throw new Error(err.error || 'Failed to generate embeddings');
    }
    return res.json();
  },

  async searchSimilarity(
    docId: string,
    query: string,
    settings: ApiSettings
  ): Promise<{
    query: string;
    queryStats: any;
    rankedResults: SimilarityResult[];
    topMatchExplanation: any;
    totalChunksQueried: number;
  }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (settings.apiKey) {
      headers['x-api-key'] = settings.apiKey;
    }

    const res = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        docId,
        query,
        provider: settings.provider,
        model: settings.model,
        apiKey: settings.apiKey,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Search failed' }));
      throw new Error(err.error || 'Search query failed');
    }
    return res.json();
  },

  async getPCA(docId: string): Promise<PCAResult> {
    const res = await fetch(`${API_BASE}/pca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId }),
    });
    if (!res.ok) throw new Error('Failed to compute PCA');
    return res.json();
  },

  async compareChunks(docId: string, chunkIdA: string, chunkIdB: string): Promise<any> {
    const res = await fetch(`${API_BASE}/compare-chunks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, chunkIdA, chunkIdB }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Comparison failed' }));
      throw new Error(err.error || 'Failed to compare chunks');
    }
    return res.json();
  },
};
