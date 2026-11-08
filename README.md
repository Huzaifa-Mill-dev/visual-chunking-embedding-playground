# Visual Document Chunking & Embedding Playground
> An interactive educational workbench demonstrating how raw documents are transformed into text chunks, converted into high-dimensional vector embeddings, and retrieved using semantic similarity for Retrieval-Augmented Generation (RAG).

---

## 🎯 Educational Overview

When developers start learning LLMs and RAG, critical transformations happen invisibly behind black-box frameworks (like LangChain, LlamaIndex, or vector database SDKs).

This project makes **every step of the pipeline visible, inspectable, and interactive**:
1. **Document Ingestion:** See raw character, word, and line statistics.
2. **Text Chunking:** Watch how sliding windows, overlaps, and recursive separators partition the document.
3. **Visual Chunk Boundary Map:** Inspect color-coded boundaries and overlapping margins directly within the original document.
4. **Vector Embeddings:** Understand high-dimensional coordinates, $L_2$ norms, value ranges, and dimension heatmaps.
5. **PCA 2D Projection:** Explore how 64-D, 768-D, or 1536-D embedding spaces are compressed into 2D scatter plots to reveal semantic clusters.
6. **Semantic Similarity & Cosine Retrieval:** Run real-time queries with a full step-by-step vector math breakdown (dot products, vector norms, angles in degrees).
7. **Chunk-to-Chunk Comparator:** Compare any two chunks side-by-side to understand angular separation in hyperspace.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm** (or pnpm / yarn)

### 1. Installation
Clone or navigate to the project directory:
```bash
cd "C:\Users\alefi\.gemini\antigravity\scratch\chunking-embedding-playground"
npm install
```

### 2. Development Mode
Runs both the Express API backend (`localhost:3001`) and the Vite React frontend (`localhost:5173`) concurrently:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Production Build & Run
```bash
npm run build
npm start
```
The server will host the full application at **[http://localhost:3001](http://localhost:3001)**.

---

## 🧩 Architectural Decisions & Rationale

### 1. Transparent Implementations vs. Black-Box Libraries
In production systems, developers often call `RecursiveCharacterTextSplitter.from_tiktoken_encoder()`. While convenient, this obscures:
- Why certain split points are chosen.
- Exactly which characters are repeated across chunk overlaps.
- How chunk offsets map back to original document positions.

**Decision:** We implemented all five chunking algorithms (`fixed`, `fixed-overlap`, `recursive`, `paragraph`, `sentence`) from scratch in TypeScript with extensive documentation. Every chunk explicitly records its `[startChar, endChar]` offsets, character count, token estimate, and overlap with adjacent chunks.

### 2. Built-in Local Educational Vectorizer (Zero API Keys Required)
Relying strictly on paid API keys (OpenAI or Gemini) creates friction for learners and fails when offline or quota-limited.

**Decision:** We created an **Educational Dense Vectorizer (64 Dimensions)** that:
- Runs 100% locally with zero external network requests.
- Maps domain topics (biology, computing, RAG, AI agents) onto calibrated vector dimensions.
- Normalizes vectors onto the 64-dimensional unit hypersphere ($L_2\text{ norm} = 1.0$).
- Produces realistic cosine similarity scores: related concepts (e.g. "plants convert light" and "chloroplasts produce glucose") project to high cosine similarity (>0.85), while unrelated topics project near orthogonality (~0.15).

Users can also seamlessly switch to **Google Gemini (`text-embedding-004`)**, **OpenAI (`text-embedding-3-small`)**, or **Ollama** in the Settings modal!

### 3. Secure API Key Management
- API keys are entered via the client UI or stored in server `.env` (`GEMINI_API_KEY`, `OPENAI_API_KEY`).
- Keys are transmitted via request headers (`x-api-key`) directly to the backend Express server, which proxies all API calls.
- Keys are **never exposed** in client bundles, public HTML, or client-side storage.

### 4. Deterministic Embedding Cache
Generating embeddings through commercial APIs costs time and tokens.
- We implemented an SHA-256 hash-based embedding cache:
  $$\text{Key} = \text{SHA256}(\text{provider} + \text{model} + \text{chunkText})$$
- When you re-chunk or re-load documents, existing embeddings are retrieved instantly from disk (`data/embedding_cache.json`), saving API quotas.

### 5. Principal Component Analysis (PCA) 2D Projection
High-dimensional vectors cannot be directly visualized by human eyes.
- We implemented a mathematical PCA module in pure TypeScript using Power Iteration to compute the top two eigenvectors (Principal Component 1 and 2).
- The UI displays the **Explained Variance Ratio** for both axes and plots all chunks on an interactive SVG canvas.
- Clicking any point in the 2D plot selects that chunk across the Document Boundary Map and the Chunk Inspector.

---

## 🔬 Core Concepts & Algorithms

### 1. Chunking Strategies Compared

| Strategy | Logic | Pros | Cons | Ideal For |
| :--- | :--- | :--- | :--- | :--- |
| **Fixed Size** | Rigid window of $N$ characters, step size = $N$ | Fastest, uniform length, zero redundancy | Cuts words in half, destroys sentence context | Raw byte streams, baseline benchmarking |
| **Sliding Window Overlap** | Window of $N$ chars, step size = $(N - \text{overlap})$ | Guarantees facts near boundaries are retained | Duplicates text, increases token costs | Fixed-context windows, sensor logs |
| **Recursive Splitting** | Priority order: `\n\n` → `\n` → `. ` → ` ` → `""` | Preserves paragraphs and sentences | Variable chunk lengths | General documentation, Markdown, RAG |
| **Paragraph-Based** | Splits on `\n\n+`, groups small paragraphs | Maximum semantic cohesion | Uneven chunk sizes | Essays, articles, legal docs |
| **Sentence-Based** | Splits on sentence boundaries (`.! ?`) | Preserves complete propositions | Needs good sentence punctuation | FAQ lists, dialogue transcripts |

### 2. The Math of Cosine Similarity

Given a query vector $A$ and a stored chunk vector $B$ in $D$-dimensional space:

$$\text{Dot Product: } A \cdot B = \sum_{i=1}^{D} A_i B_i$$

$$\text{Vector Magnitudes (L2 Norms): } \|A\| = \sqrt{\sum_{i=1}^{D} A_i^2}, \quad \|B\| = \sqrt{\sum_{i=1}^{D} B_i^2}$$

$$\text{Cosine Similarity: } \cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|}$$

$$\text{Angular Separation: } \theta = \arccos(\cos(\theta)) \times \frac{180^\circ}{\pi}$$

When embeddings are unit-normalized ($\|A\| = 1$ and $\|B\| = 1$), the formula simplifies to:
$$\cos(\theta) = A \cdot B$$

---

## 📂 Project Structure

```
chunking-embedding-playground/
├── package.json                 # Unified workspace dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite bundler with API reverse-proxy
├── tailwind.config.js           # Tailwind CSS styling system
├── index.html                   # HTML entry point
│
├── server/                      # Node.js Express Backend
│   └── src/
│       ├── index.ts             # Express REST API server
│       ├── types.ts             # Shared data interfaces
│       ├── chunkers/            # Transparent Chunking Implementations
│       │   ├── fixed.ts         # Fixed-size character chunking
│       │   ├── fixedOverlap.ts  # Sliding window with overlap
│       │   ├── recursive.ts     # Hierarchical recursive splitting
│       │   ├── paragraph.ts     # Paragraph-based chunking
│       │   ├── sentence.ts      # Sentence proposition chunking
│       │   └── index.ts         # Strategy catalog & dispatcher
│       ├── embeddings/          # Embedding Engine
│       │   ├── provider.ts      # Provider interface & vector utilities
│       │   ├── educationalEmbedder.ts # Local 64-D semantic vectorizer
│       │   ├── geminiEmbedder.ts# Google Gemini text-embedding-004
│       │   ├── openaiEmbedder.ts# OpenAI text-embedding-3-small
│       │   ├── ollamaEmbedder.ts# Local Ollama connection
│       │   └── cache.ts         # Disk & memory hash cache
│       ├── similarity/          # Mathematical Analysis
│       │   ├── cosine.ts        # Cosine similarity & telemetry
│       │   └── pca.ts           # Principal Component Analysis (2D)
│       ├── storage/
│       │   └── db.ts            # Lightweight JSON persistence
│       └── sampleDocs/
│           └── index.ts         # Curated educational sample documents
│
├── client/                      # React 18 + Vite Frontend
│   └── src/
│       ├── main.tsx             # React DOM root
│       ├── App.tsx              # Main interactive playground
│       ├── index.css            # Tailwind & animation styles
│       ├── types/index.ts       # Client data models
│       ├── utils/
│       │   ├── api.ts           # API client layer
│       │   └── colors.ts        # Consistent chunk color palette
│       └── components/
│           ├── Navbar.tsx       # Document switcher, model badge, actions
│           ├── DocumentViewer.tsx # Interactive Chunk Boundary Map
│           ├── ChunkingConfigPanel.tsx # Strategy picker & size/overlap sliders
│           ├── ChunkList.tsx    # Scrollable chunk cards with metadata
│           ├── EmbeddingSection.tsx # Vector stats, sparkline & raw float inspector
│           ├── Embedding2DPlot.tsx # Interactive SVG PCA scatter plot
│           ├── SimilaritySearchPanel.tsx # Semantic search & vector math telemetry
│           ├── DataRecordModal.tsx # Full JSON schema inspector
│           ├── ConceptGuideModal.tsx # 5-module comprehensive educational guide
│           ├── SettingsModal.tsx# Provider & API key configuration
│           └── UploadModal.tsx  # TXT / MD file ingestion modal
│
└── data/                        # Persistent Storage (Generated on run)
    ├── db.json                  # Saved documents, chunk configurations
    └── embedding_cache.json     # Saved embedding vectors
```

---

## 🗺️ Future Learning Roadmap

This project is built as Phase 1 & Phase 2 of a modern AI engineering curriculum:

- [x] **Phase 1 — Document Processing:** Ingestion, statistics, 5 chunking strategies, interactive boundary visualization.
- [x] **Phase 2 — Vector Embeddings:** High-dimensional vectors, L2 normalization, dimension sparkline, 2D PCA projection.
- [x] **Phase 3 — Semantic Search:** Cosine similarity calculation, step-by-step vector math telemetry, chunk comparison.
- [ ] **Phase 4 — Vector Databases:** Dedicated vector indexing (HNSW, IVF-Flat), Approximate Nearest Neighbors (ANN), metadata filtering.
- [ ] **Phase 5 — Full RAG:** Grounded context injection into Gemini / OpenAI prompts, source citations, hallucination evaluation.

---

## 📜 License
MIT License. Built for hands-on AI engineering education.
