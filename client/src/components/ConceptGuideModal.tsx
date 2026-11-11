import React, { useState } from "react";
import {
  X,
  BookOpen,
  Layers,
  Sparkles,
  Sliders,
  Compass,
  Calculator,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface ConceptGuideModalProps {
  onClose: () => void;
}

export const ConceptGuideModal: React.FC<ConceptGuideModalProps> = ({
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    "chunking" | "tradeoffs" | "embeddings" | "similarity" | "rag"
  >("chunking");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Educational Concept Guide: The RAG Foundations
              </h2>
              <p className="text-xs text-slate-400">
                Mastering Document Ingestion, Chunking Mechanics, Embeddings,
                and Vector Search
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("chunking")}
            className={`py-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "chunking"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Why Chunk Documents?</span>
          </button>

          <button
            onClick={() => setActiveTab("tradeoffs")}
            className={`py-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "tradeoffs"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Size vs. Overlap Trade-offs</span>
          </button>

          <button
            onClick={() => setActiveTab("embeddings")}
            className={`py-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "embeddings"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. How Embeddings Work</span>
          </button>

          <button
            onClick={() => setActiveTab("similarity")}
            className={`py-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "similarity"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>4. Cosine Similarity & Math</span>
          </button>

          <button
            onClick={() => setActiveTab("rag")}
            className={`py-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "rag"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>5. Connecting to RAG</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed custom-scrollbar flex-1">
          {activeTab === "chunking" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                The Three Inescapable Realities of Document Ingestion
              </h3>

              <p>
                When building applications powered by Large Language Models
                (LLMs), one might ask:
                <em>
                  {" "}
                  "Why can't we simply feed an entire 200-page manual or legal
                  contract directly to the model?"
                </em>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs uppercase font-bold text-rose-400 block">
                    1. The "Lost in the Middle" Dilemma
                  </span>
                  <p className="text-xs text-slate-400 leading-normal">
                    Transformer attention mechanisms are naturally biased toward
                    tokens at the very beginning and very end of their prompt
                    context window. When critical facts are buried in the middle
                    of a 100,000-token prompt, retrieval accuracy drops
                    drastically.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs uppercase font-bold text-amber-400 block">
                    2. Vector Dilution
                  </span>
                  <p className="text-xs text-slate-400 leading-normal">
                    An embedding model maps text into a single point in vector
                    space. Squeezing an entire 50-page book into one
                    768-dimensional vector blurs every specific fact into a
                    generic average. Slicing into chunks preserves laser-focused
                    semantic resolution.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs uppercase font-bold text-cyan-400 block">
                    3. Latency & Token Economics
                  </span>
                  <p className="text-xs text-slate-400 leading-normal">
                    Processing 100,000 tokens for every user question incurs
                    severe inference latency (5–20 seconds) and high token
                    billing costs. Retrieving only the 3 most relevant 300-word
                    chunks answers queries in milliseconds at 99% lower cost.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tradeoffs" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Chunk Size vs. Overlap: The Goldilocks Problem
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs uppercase font-bold text-cyan-400 block">
                    Small Chunks (e.g. 100–250 Chars)
                  </span>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    <li>
                      <strong className="text-slate-300">Pros:</strong> High
                      semantic precision. Embeddings are very sharp and
                      specific.
                    </li>
                    <li>
                      <strong className="text-slate-300">Cons:</strong> Lacks
                      surrounding context. A chunk might say{" "}
                      <em>"It failed due to voltage"</em> without saying{" "}
                      <em>what</em> failed.
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs uppercase font-bold text-indigo-400 block">
                    Large Chunks (e.g. 800–2000 Chars)
                  </span>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    <li>
                      <strong className="text-slate-300">Pros:</strong> Complete
                      thoughts, explanations, and surrounding narrative remain
                      intact.
                    </li>
                    <li>
                      <strong className="text-slate-300">Cons:</strong> Vector
                      becomes diluted with multiple topics. High LLM context
                      token usage.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 space-y-2">
                <span className="text-xs uppercase font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Why Chunk Overlap Matters:
                </span>
                <p className="text-xs text-slate-300">
                  Facts often cross the boundary between two chunks (e.g.{" "}
                  <em>
                    "The critical defect was discovered in... [chunk split]
                    ...Module B by Alice."
                  </em>
                  ). Without overlap, neither chunk contains the full
                  relationship! By copying 10% to 20% of trailing text into the
                  next chunk, we guarantee that boundary facts are never
                  severed.
                </p>
              </div>
            </div>
          )}

          {activeTab === "embeddings" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                What Is an Embedding Model?
              </h3>

              <p>
                An embedding model is a specialized neural network (like a
                Transformer encoder) trained to map natural language onto
                continuous geometric coordinates on a high-dimensional
                hypersphere.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-200 block mb-1">
                    Text Goes In
                  </span>
                  <p className="text-xs text-slate-400">
                    Raw strings of characters, sentences, or paragraphs are
                    tokenized into subword tokens and passed through attention
                    layers.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-cyan-300 block mb-1">
                    Vectors Come Out
                  </span>
                  <p className="text-xs text-slate-400">
                    The model outputs an array of floating-point numbers (e.g.
                    768 floats for Gemini gemini-embedding-001, 1536 for
                    OpenAI).
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-emerald-300 block mb-1">
                    Geometry = Meaning
                  </span>
                  <p className="text-xs text-slate-400">
                    Points that are close in angle or distance represent related
                    conceptual meanings, regardless of literal words used.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <strong className="text-slate-200 block">
                  Do individual vector dimensions represent human words?
                </strong>
                No! In modern deep embeddings, representation is{" "}
                <em>distributed</em>. Dimension #42 does not mean "dog" or
                "happy". Instead, semantic concepts are distributed across
                complex linear combinations of hundreds of dimensions
                simultaneously.
              </div>
            </div>
          )}

          {activeTab === "similarity" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-bold">
                  4
                </span>
                Cosine Similarity: Measuring Angles in Hyperspace
              </h3>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-800/50 space-y-3 font-mono text-xs">
                <div className="text-cyan-300 font-bold text-sm">
                  cos(θ) = (A · B) / (||A|| * ||B||)
                </div>
                <p className="text-slate-400 font-sans">
                  Where <strong>A · B</strong> is the Dot Product (sum of
                  dimension-by-dimension multiplications), and{" "}
                  <strong>||A||</strong> and <strong>||B||</strong> are the
                  Euclidean lengths (L2 norms) of the vectors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="font-bold text-emerald-400 text-sm block">
                    cos(0°) = 1.0
                  </span>
                  <span className="text-slate-400">
                    Identical direction (maximum semantic alignment)
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="font-bold text-cyan-400 text-sm block">
                    cos(90°) = 0.0
                  </span>
                  <span className="text-slate-400">
                    Orthogonal (perpendicular, completely unrelated topics)
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="font-bold text-rose-400 text-sm block">
                    cos(180°) = -1.0
                  </span>
                  <span className="text-slate-400">
                    Opposite direction in vector hyperspace
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rag" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-bold">
                  5
                </span>
                The Full Retrieval-Augmented Generation (RAG) Architecture
              </h3>

              <p>
                Every concept you experiment with in this playground forms the
                core data engine of modern production RAG pipelines:
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    Step 1
                  </span>
                  <div>
                    <strong className="text-slate-200 block">
                      Offline Document Ingestion & Chunking
                    </strong>
                    <span className="text-slate-400">
                      Extract text, recursively split into balanced chunks with
                      overlap, and generate vector embeddings.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                    Step 2
                  </span>
                  <div>
                    <strong className="text-slate-200 block">
                      Vector Indexing
                    </strong>
                    <span className="text-slate-400">
                      Store text, metadata, and vectors in a vector database
                      (e.g. Chroma, Pinecone, pgvector) with HNSW indexing for
                      sub-millisecond retrieval.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    Step 3
                  </span>
                  <div>
                    <strong className="text-slate-200 block">
                      Online Query & Cosine Retrieval
                    </strong>
                    <span className="text-slate-400">
                      When a user asks a question, embed their query and
                      retrieve the top-K highest similarity chunks.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                    Step 4
                  </span>
                  <div>
                    <strong className="text-slate-200 block">
                      Context Injection & Grounded LLM Generation
                    </strong>
                    <span className="text-slate-400">
                      Inject retrieved chunks into the LLM system prompt as
                      verified facts:{" "}
                      <em>
                        "Answer using only this context: [Chunk 1, Chunk 2]"
                      </em>
                      . The model generates factually grounded responses with
                      zero hallucinations!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition"
          >
            Got It, Back to Playground
          </button>
        </div>
      </div>
    </div>
  );
};
