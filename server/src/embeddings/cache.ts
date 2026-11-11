import fs from "fs";
import path from "path";
import crypto from "crypto";
import { EmbeddingVectorResult } from "./provider.js";

export class EmbeddingCache {
  private cache = new Map<string, EmbeddingVectorResult>();
  private cacheFilePath: string;

  constructor(storageDir: string = "./data") {
    if (!fs.existsSync(storageDir)) {
      try {
        fs.mkdirSync(storageDir, { recursive: true });
      } catch (err) {
        // ignore if already exists
      }
    }
    this.cacheFilePath = path.join(storageDir, "embedding_cache.json");
    this.loadFromDisk();
  }

  private generateKey(provider: string, model: string, text: string): string {
    const hash = crypto
      .createHash("sha256")
      .update(`${provider}:${model}:${text}`)
      .digest("hex");
    return hash;
  }

  get(
    provider: string,
    model: string,
    text: string,
  ): EmbeddingVectorResult | null {
    const key = this.generateKey(provider, model, text);
    const cached = this.cache.get(key);
    if (cached) {
      return { ...cached, cached: true };
    }
    return null;
  }

  set(
    provider: string,
    model: string,
    text: string,
    result: EmbeddingVectorResult,
  ): void {
    const key = this.generateKey(provider, model, text);
    this.cache.set(key, { ...result, cached: true });
    this.saveToDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        for (const [k, v] of Object.entries(parsed)) {
          this.cache.set(k, v as EmbeddingVectorResult);
        }
      }
    } catch (err) {
      console.warn("Failed to load embedding cache from disk:", err);
    }
  }

  private saveToDisk(): void {
    try {
      const obj: Record<string, EmbeddingVectorResult> = {};
      for (const [k, v] of this.cache.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(obj), "utf-8");
    } catch (err) {
      console.warn("Failed to save embedding cache to disk:", err);
    }
  }

  clear(): void {
    this.cache.clear();
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        fs.unlinkSync(this.cacheFilePath);
      }
    } catch (err) {}
  }
}
