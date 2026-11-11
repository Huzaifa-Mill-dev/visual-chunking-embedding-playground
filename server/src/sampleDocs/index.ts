import { DocumentRecord } from "../types.js";

export const SAMPLE_DOCUMENTS: DocumentRecord[] = [
  {
    id: "sample-rag-overview",
    title: "Understanding RAG and Vector Retrieval",
    filename: "rag-and-vector-retrieval.md",
    fileType: "md",
    createdAt: new Date().toISOString(),
    charCount: 0, // computed below
    wordCount: 0,
    lineCount: 0,
    content: `# Retrieval-Augmented Generation (RAG) Architecture

Large Language Models (LLMs) possess vast parametric knowledge acquired during pre-training. However, this knowledge is frozen in time and inherently prone to hallucinations when asked about private enterprise data, niche domain facts, or real-time events.

To overcome these constraints, modern AI engineering utilizes Retrieval-Augmented Generation (RAG). RAG bifurcates knowledge processing into two distinct subsystems: an external retrieval engine and a generative reasoning model.

## Why Chunking Is Foundational

Directly stuffing entire multi-page manuals or legal contracts into an LLM prompt suffers from severe limitations:
1. Context Window Costs: Every token passed into an LLM incurs computational latency and financial cost.
2. Lost in the Middle Phenomenon: Studies demonstrate that LLMs pay high attention to the beginning and ending of lengthy prompts, frequently missing crucial facts embedded in the middle.
3. Embedding Dilution: Passing an entire 50-page book into a single embedding model produces an averaged, blurry vector that lacks specificity for precise queries.

Therefore, we systematically slice long documents into cohesive fragments known as chunks.

## The Role of High-Dimensional Embeddings

Once divided, each chunk is passed through an embedding model. Rather than extracting simple keywords, the embedding model maps the deep semantic meaning of the text onto a continuous geometric hypersphere (e.g. 768 or 1536 dimensions).

In this vector space, geometric proximity reflects conceptual relationship. Phrases sharing the same meaning reside close together even when using completely distinct vocabularies.

## Cosine Similarity and Vector Search

When a user submits a question, the query undergoes identical vector transformation. The search engine calculates the cosine angle between the query vector and all chunk vectors in milliseconds:

cosine_similarity = (A · B) / (||A|| * ||B||)

The highest-scoring chunks are retrieved and injected into the final system prompt as grounded context, enabling the model to generate factually verifiable answers with exact source citations.`,
  },
  {
    id: "sample-photosynthesis",
    title: "The Biochemical Machinery of Photosynthesis",
    filename: "photosynthesis-biology.txt",
    fileType: "txt",
    createdAt: new Date().toISOString(),
    charCount: 0,
    wordCount: 0,
    lineCount: 0,
    content: `Photosynthesis is the fundamental biological process through which photosynthetic organisms, primarily plants, algae, and cyanobacteria, convert electromagnetic light energy into chemical potential energy stored within organic molecules.

The overall chemical equation of oxygenic photosynthesis can be summarized as:
6 CO2 + 6 H2O + light energy -> C6H12O6 + 6 O2

This complex pathway occurs inside specialized intracellular organelles termed chloroplasts, predominantly located within the mesophyll cells of plant leaves. The process divides mechanistically into two interdependent phases: light-dependent reactions and light-independent reactions (the Calvin cycle).

In the light reactions, photon energy is absorbed by specialized pigment molecules, predominantly chlorophyll a and chlorophyll b, embedded within the thylakoid membranes. When a photon strikes a chlorophyll reaction center, electrons become excited to a higher energy state and are transferred along an electron transport chain.

Water molecules undergo photolysis, splitting into oxygen gas, protons, and replacement electrons. The high-energy proton gradient generated across the thylakoid membrane drives ATP synthase, producing adenosine triphosphate (ATP) and reducing NADP+ into NADPH.

During the subsequent Calvin cycle, occurring within the stroma, the catalytic enzyme RuBisCO facilitates carbon fixation. By attaching atmospheric carbon dioxide to ribulose-1,5-bisphosphate, the cycle synthesizes glyceraldehyde-3-phosphate, which plants subsequently assemble into glucose, sucrose, and cellulose.`,
  },
  {
    id: "sample-distributed-cap",
    title: "Distributed Systems & The CAP Theorem",
    filename: "distributed-systems-cap.md",
    fileType: "md",
    createdAt: new Date().toISOString(),
    charCount: 0,
    wordCount: 0,
    lineCount: 0,
    content: `# The CAP Theorem in Distributed Architecture

Formulated by Eric Brewer in 2000 and subsequently proved by Seth Gilbert and Nancy Lynch, the CAP theorem establishes that any distributed data store can simultaneously guarantee at most two out of three fundamental properties:

## 1. Consistency (C)
Every read operation receives the most recent write or returns an error. All clients see identical data at the exact same moment regardless of which replica node responds.

## 2. Availability (A)
Every non-failing node returns a non-error response for every received request, though without guaranteeing that it contains the most recent write.

## 3. Partition Tolerance (P)
The distributed cluster continues to function despite an arbitrary number of messages being delayed, dropped, or corrupted by network infrastructure failures between nodes.

## The Partition Reality

In real-world physical networks, network partitions (P) are unavoidable. Fiber optic cables get severed, switches fail, and packets drop. Therefore, distributed architects do not actually choose between C, A, and P. Instead, when a network partition inevitably occurs, the system must decide between Consistency (CP) and Availability (AP).

In a CP system, nodes refuse to answer writes until consensus is restored, prioritizing correctness over uptime. In an AP system, nodes continue serving read and write traffic locally, adopting eventual consistency algorithms like CRDTs or vector clocks to reconcile conflicting updates after network healing.`,
  },
  {
    id: "sample-ai-agents",
    title: "Autonomous AI Agents and Tool Orchestration",
    filename: "ai-agents-evolution.md",
    fileType: "md",
    createdAt: new Date().toISOString(),
    charCount: 0,
    wordCount: 0,
    lineCount: 0,
    content: `# Evolution of Autonomous AI Agents

Early language models operated as passive text completion systems. Given an input prompt, they predicted the statistically most probable sequence of continuation tokens. In contrast, modern agentic systems represent a paradigm shift: models act as reasoning engines capable of autonomous execution, environmental observation, and dynamic tool orchestration.

## Core Architectural Components of an Agent

1. Planning and Decomposition
Complex, open-ended goals are recursively decomposed into manageable sub-tasks. Using methodologies like Chain-of-Thought (CoT) and Tree-of-Thoughts (ToT), the agent formulates multi-step strategies before executing immediate actions.

2. Tool Calling and Environment Interaction
Agents interact with external tools through structured schemas (such as OpenAPI specifications and Model Context Protocol). An agent can query web search engines, execute terminal commands, run sandboxed Python scripts, and invoke database APIs.

3. Cognitive Observation Loops (ReAct)
The model follows a continuous Reason -> Act -> Observe feedback loop. If an executed command fails or yields unexpected output, the agent parses the error, updates its internal hypothesis, and generates a corrective follow-up action.

4. Memory Architecture
Short-term memory corresponds to context window state, maintaining immediate dialog and observation history. Long-term memory utilizes semantic vector retrieval to access historical experiences, user preferences, and enterprise documentation on demand.`,
  },
];

// Initialize counts
for (const doc of SAMPLE_DOCUMENTS) {
  doc.charCount = doc.content.length;
  doc.wordCount = doc.content.trim().split(/\s+/).length;
  doc.lineCount = doc.content.split("\n").length;
}
