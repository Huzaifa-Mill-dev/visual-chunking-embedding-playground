import fs from 'fs';
import path from 'path';
import { DocumentRecord, ChunkRecord, SessionState, ChunkOptions } from '../types.js';

interface DatabaseSchema {
  documents: Record<string, DocumentRecord>;
  chunksByDoc: Record<string, {
    options: ChunkOptions;
    chunks: ChunkRecord[];
  }>;
  activeDocId: string | null;
}

export class JsonDatabase {
  private filePath: string;
  private data: DatabaseSchema;

  constructor(storageDir: string = './data') {
    if (!fs.existsSync(storageDir)) {
      try {
        fs.mkdirSync(storageDir, { recursive: true });
      } catch (err) {}
    }
    this.filePath = path.join(storageDir, 'db.json');
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to load database from disk, initializing fresh:', err);
    }
    return {
      documents: {},
      chunksByDoc: {},
      activeDocId: null,
    };
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  // Documents
  getAllDocuments(): DocumentRecord[] {
    return Object.values(this.data.documents);
  }

  getDocument(id: string): DocumentRecord | null {
    return this.data.documents[id] || null;
  }

  saveDocument(doc: DocumentRecord): void {
    this.data.documents[doc.id] = doc;
    this.data.activeDocId = doc.id;
    this.save();
  }

  deleteDocument(id: string): void {
    delete this.data.documents[id];
    delete this.data.chunksByDoc[id];
    if (this.data.activeDocId === id) {
      const remaining = Object.keys(this.data.documents);
      this.data.activeDocId = remaining.length > 0 ? remaining[0] : null;
    }
    this.save();
  }

  getActiveDocId(): string | null {
    return this.data.activeDocId;
  }

  setActiveDocId(id: string | null): void {
    this.data.activeDocId = id;
    this.save();
  }

  // Chunks & Strategy
  getDocChunks(docId: string): { options?: ChunkOptions; chunks: ChunkRecord[] } | null {
    return this.data.chunksByDoc[docId] || null;
  }

  saveDocChunks(docId: string, options: ChunkOptions, chunks: ChunkRecord[]): void {
    this.data.chunksByDoc[docId] = { options, chunks };
    this.save();
  }

  updateChunkEmbedding(docId: string, chunkId: string, embedding: number[], model: string): void {
    const entry = this.data.chunksByDoc[docId];
    if (entry) {
      const chunk = entry.chunks.find(c => c.id === chunkId);
      if (chunk) {
        chunk.embedding = embedding;
        chunk.model = model;
        chunk.dimensions = embedding.length;
        chunk.embeddedAt = new Date().toISOString();
        this.save();
      }
    }
  }
}
