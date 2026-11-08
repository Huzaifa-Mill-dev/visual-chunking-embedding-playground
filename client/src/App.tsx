import React, { useState, useEffect } from 'react';
import { 
  ChunkOptions, 
  ChunkRecord, 
  DocumentRecord, 
  PCAResult, 
  SimilarityResult, 
  StrategyInfo,
  CosineExplanation 
} from './types/index.js';
import { api, ApiSettings } from './utils/api.js';

import { Navbar } from './components/Navbar.js';
import { DocumentViewer } from './components/DocumentViewer.js';
import { ChunkingConfigPanel } from './components/ChunkingConfigPanel.js';
import { EmbeddingSection } from './components/EmbeddingSection.js';
import { Embedding2DPlot } from './components/Embedding2DPlot.js';
import { SimilaritySearchPanel } from './components/SimilaritySearchPanel.js';
import { ChunkList } from './components/ChunkList.js';
import { DataRecordModal } from './components/DataRecordModal.js';
import { ConceptGuideModal } from './components/ConceptGuideModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { UploadModal } from './components/UploadModal.js';

import { 
  Sparkles, 
  Layers, 
  Compass, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  BookOpen 
} from 'lucide-react';

export default function App() {
  // Documents & Active Doc
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocumentRecord | null>(null);
  const [chunks, setChunks] = useState<ChunkRecord[]>([]);
  const [chunkOptions, setChunkOptions] = useState<ChunkOptions>({
    strategy: 'recursive',
    chunkSize: 350,
    chunkOverlap: 50,
  });

  // Strategies Metadata
  const [strategies, setStrategies] = useState<Record<string, StrategyInfo>>({});

  // Selection
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null);

  // Embedding & Search State
  const [pcaData, setPcaData] = useState<PCAResult | null>(null);
  const [searchResults, setSearchResults] = useState<SimilarityResult[]>([]);
  const [topMatchExplanation, setTopMatchExplanation] = useState<CosineExplanation | null>(null);
  const [cacheStats, setCacheStats] = useState<{ newlyGenerated: number; cached: number } | null>(null);

  // API & Model Settings
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => {
    const saved = localStorage.getItem('rag_playground_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {}
    }
    return {
      provider: 'educational',
      model: 'educational-semantic-64',
    };
  });

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [recordModalChunk, setRecordModalChunk] = useState<ChunkRecord | null>(null);

  // Loading States
  const [isProcessingChunking, setIsProcessingChunking] = useState(false);
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPCA, setIsLoadingPCA] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Initial Load: Documents & Strategies
  useEffect(() => {
    async function init() {
      try {
        const [docsRes, stratRes] = await Promise.all([
          api.getDocuments(),
          api.getStrategies(),
        ]);
        setDocuments(docsRes.documents);
        setStrategies(stratRes);

        if (docsRes.documents.length > 0) {
          const targetId = docsRes.activeId || docsRes.documents[0].id;
          await loadDocumentDetails(targetId);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to initialize playground');
      }
    }
    init();
  }, []);

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('rag_playground_settings', JSON.stringify(apiSettings));
  }, [apiSettings]);

  // Load Document Details
  const loadDocumentDetails = async (id: string) => {
    try {
      setErrorMessage(null);
      const res = await api.getDocument(id);
      setActiveDoc(res.document);
      setChunks(res.chunks || []);
      if (res.options) {
        setChunkOptions(res.options);
      }
      setSelectedChunkId(res.chunks?.[0]?.id || null);
      setSearchResults([]);
      setTopMatchExplanation(null);

      // If document already has embedded chunks, trigger PCA
      if (res.chunks?.some(c => c.embedding && c.embedding.length > 0)) {
        loadPCA(res.document.id);
      } else {
        setPcaData(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load document');
    }
  };

  // Re-chunk Document
  const handleApplyChunkOptions = async (newOptions: ChunkOptions) => {
    if (!activeDoc) return;
    setIsProcessingChunking(true);
    setErrorMessage(null);
    try {
      const res = await api.chunkDocument(activeDoc.id, newOptions);
      setChunks(res.chunks);
      setChunkOptions(res.options);
      setSelectedChunkId(res.chunks[0]?.id || null);
      setSearchResults([]);
      setTopMatchExplanation(null);

      // Check if PCA can be refreshed
      if (res.chunks.some(c => c.embedding && c.embedding.length > 0)) {
        await loadPCA(activeDoc.id);
      } else {
        setPcaData(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Chunking failed');
    } finally {
      setIsProcessingChunking(false);
    }
  };

  // Generate All Embeddings
  const handleGenerateAllEmbeddings = async () => {
    if (!activeDoc) return;
    setIsGeneratingEmbeddings(true);
    setErrorMessage(null);
    try {
      const res = await api.generateEmbeddings(activeDoc.id, apiSettings);
      setChunks(res.chunks);
      setCacheStats({
        newlyGenerated: res.newlyGeneratedCount,
        cached: res.cachedCount,
      });

      // Update selected chunk reference
      if (selectedChunkId) {
        const updated = res.chunks.find(c => c.id === selectedChunkId);
        if (updated) setSelectedChunkId(updated.id);
      }

      // Compute PCA projection
      await loadPCA(activeDoc.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Embedding generation failed');
    } finally {
      setIsGeneratingEmbeddings(false);
    }
  };

  // Compute PCA
  const loadPCA = async (docId: string) => {
    setIsLoadingPCA(true);
    try {
      const res = await api.getPCA(docId);
      setPcaData(res);
    } catch (err) {
      console.warn('PCA calculation skipped:', err);
    } finally {
      setIsLoadingPCA(false);
    }
  };

  // Semantic Search
  const handleSearch = async (query: string) => {
    if (!activeDoc) return;
    setIsSearching(true);
    setErrorMessage(null);
    try {
      const res = await api.searchSimilarity(activeDoc.id, query, apiSettings);
      setSearchResults(res.rankedResults);
      setTopMatchExplanation(res.topMatchExplanation);

      // Auto-select rank 1 match
      if (res.rankedResults.length > 0) {
        setSelectedChunkId(res.rankedResults[0].chunkId);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Semantic search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Upload New Document
  const handleUploadDocument = async (data: { title: string; filename: string; content: string; fileType?: 'txt' | 'md' }) => {
    const res = await api.uploadDocument(data);
    setDocuments(prev => [res.document, ...prev]);
    setActiveDoc(res.document);
    setChunks(res.chunks);
    setChunkOptions(res.options);
    setSelectedChunkId(res.chunks[0]?.id || null);
    setPcaData(null);
    setSearchResults([]);
  };

  // Reset Sample Documents
  const handleResetSamples = async () => {
    try {
      await api.resetSamples();
      const docsRes = await api.getDocuments();
      setDocuments(docsRes.documents);
      if (docsRes.documents.length > 0) {
        await loadDocumentDetails(docsRes.documents[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset sample documents');
    }
  };

  // Compare two chunks
  const handleCompareChunks = async (chunkAId: string, chunkIdB: string) => {
    if (!activeDoc) return null;
    return api.compareChunks(activeDoc.id, chunkAId, chunkIdB);
  };

  const selectedChunk = chunks.find(c => c.id === selectedChunkId) || chunks[0] || null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        documents={documents}
        activeDoc={activeDoc}
        onSelectDoc={loadDocumentDetails}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetSamples={handleResetSamples}
        settings={apiSettings}
      />

      {/* Main Educational Pipeline Progress Banner */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">RAG Journey:</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-cyan-400 font-medium bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                <span>1. Ingest Raw Doc</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="flex items-center gap-1 text-indigo-400 font-medium bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                <span>2. Chunk & Overlap</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                <span>3. High-Dim Vectors</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="flex items-center gap-1 text-amber-400 font-medium bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                <span>4. Semantic Retrieval</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition"
          >
            <BookOpen className="w-3 h-3" />
            <span>Read Step-by-Step Concepts</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-3">
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto w-full p-4 flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left / Middle Workbench (8 cols on large screens) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Document Viewer with Boundary Highlighting */}
            <DocumentViewer
              document={activeDoc}
              chunks={chunks}
              selectedChunkId={selectedChunkId}
              onSelectChunk={setSelectedChunkId}
            />

            {/* 2. Interactive Chunking Configuration Workbench */}
            <ChunkingConfigPanel
              options={chunkOptions}
              strategies={strategies}
              chunks={chunks}
              onApplyOptions={handleApplyChunkOptions}
              isProcessing={isProcessingChunking}
            />

            {/* 3. Vector Embeddings & Dimension Inspector */}
            <EmbeddingSection
              chunks={chunks}
              selectedChunk={selectedChunk}
              onSelectChunk={setSelectedChunkId}
              onGenerateAll={handleGenerateAllEmbeddings}
              onOpenRecord={(c) => setRecordModalChunk(c)}
              isGenerating={isGeneratingEmbeddings}
              settings={apiSettings}
              cacheStats={cacheStats}
            />

            {/* 4. 2D Embedding Projection (PCA) */}
            <Embedding2DPlot
              pcaData={pcaData}
              chunks={chunks}
              selectedChunkId={selectedChunkId}
              onSelectChunk={setSelectedChunkId}
              onRefreshPCA={() => activeDoc && loadPCA(activeDoc.id)}
              isLoading={isLoadingPCA}
            />

            {/* 5. Semantic Search & Vector Cosine Similarity */}
            <SimilaritySearchPanel
              chunks={chunks}
              docId={activeDoc?.id || ''}
              selectedChunkId={selectedChunkId}
              onSelectChunk={setSelectedChunkId}
              onSearch={handleSearch}
              searchResults={searchResults}
              topMatchExplanation={topMatchExplanation}
              isSearching={isSearching}
              onCompareTwoChunks={handleCompareChunks}
            />
          </div>

          {/* Right Sidebar: Chunk Catalog (4 cols on large screens) */}
          <div className="lg:col-span-4 sticky top-16 space-y-4">
            <ChunkList
              chunks={chunks}
              selectedChunkId={selectedChunkId}
              onSelectChunk={setSelectedChunkId}
              onOpenRecord={(c) => setRecordModalChunk(c)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {isUploadOpen && (
        <UploadModal
          onUpload={handleUploadDocument}
          onClose={() => setIsUploadOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={apiSettings}
          onSave={setApiSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isGuideOpen && (
        <ConceptGuideModal
          onClose={() => setIsGuideOpen(false)}
        />
      )}

      {recordModalChunk && (
        <DataRecordModal
          chunk={recordModalChunk}
          onClose={() => setRecordModalChunk(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          Visual Document Chunking & Embedding Playground — Built for understanding the mathematical foundations of LLMs and RAG.
        </p>
      </footer>
    </div>
  );
}
