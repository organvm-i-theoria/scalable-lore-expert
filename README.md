# Scalable Lore Expert System

[![CI](https://github.com/organvm-i-theoria/scalable-lore-expert/actions/workflows/ci.yml/badge.svg)](https://github.com/organvm-i-theoria/scalable-lore-expert/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-pending-lightgrey)](https://github.com/organvm-i-theoria/scalable-lore-expert)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/organvm-i-theoria/scalable-lore-expert/blob/main/LICENSE)
[![Organ I](https://img.shields.io/badge/Organ-I%20Theoria-8B5CF6)](https://github.com/organvm-i-theoria)
[![Status](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/organvm-i-theoria/scalable-lore-expert)
[![Python](https://img.shields.io/badge/lang-Python-informational)](https://github.com/organvm-i-theoria/scalable-lore-expert)


[![CI](https://github.com/organvm-i-theoria/scalable-lore-expert/actions/workflows/ci-python.yml/badge.svg)](https://github.com/organvm-i-theoria/scalable-lore-expert/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![ORGAN-I: Theoria](https://img.shields.io/badge/ORGAN--I-Theoria-1a237e?style=flat-square)](https://github.com/organvm-i-theoria)
[![Status: DESIGN_ONLY](https://img.shields.io/badge/Status-DESIGN__ONLY-lightgrey?style=flat-square)](#)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=flat-square&logo=python&logoColor=white)](https://www.python.org)

[![Neo4j](https://img.shields.io/badge/Neo4j-Graph%20DB-008CC1?style=flat-square&logo=neo4j&logoColor=white)](https://neo4j.com)
[![Kafka](https://img.shields.io/badge/Kafka-Streaming-231F20?style=flat-square&logo=apachekafka&logoColor=white)](https://kafka.apache.org)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io)

**An ontological knowledge management system that applies Dante Alighieri's epistemological framework from the *Divine Comedy* to the problem of modeling, querying, and exploring complex fictional universes at scale.**

This repository is part of **ORGAN-I (Theoria)** — the epistemological and theoretical foundations layer of the [eight-organ system](https://github.com/meta-organvm). It treats narrative lore not as a flat database problem but as an ontological one: the structure of knowledge about a fictional universe mirrors the structure of knowledge itself, and the medieval epistemological architecture Dante inherited from Aquinas, Aristotle, and the Neoplatonists provides a surprisingly effective framework for organizing that knowledge into layers of increasing abstraction. The system ingests raw narrative data (character entries, episode summaries, timeline events), transforms it through entity resolution and relationship extraction, and surfaces it as a semantic graph supporting natural-language queries, spoiler-aware progressive disclosure, and cross-narrative thematic analysis.

---

## Table of Contents

1. [Epistemological Foundation](#1-epistemological-foundation)
2. [Solution Overview](#2-solution-overview)
3. [Technical Architecture](#3-technical-architecture)
4. [Installation and Setup](#4-installation-and-setup)
5. [Usage and API](#5-usage-and-api)
6. [Working Examples](#6-working-examples)
7. [Research Foundation](#7-research-foundation)
8. [Testing and Quality](#8-testing-and-quality)
9. [Cross-References](#9-cross-references)
10. [Contributing](#10-contributing)
11. [License and Author](#11-license-and-author)

---

## 1. Epistemological Foundation

The system is organized around a three-layer ontological model derived from the tripartite structure of Dante's *Commedia*. This is not an arbitrary metaphor. Dante's poem encodes a complete medieval epistemology — a theory of how knowledge is structured, layered, and progressively refined as the knower ascends from particulars to universals. That epistemological architecture maps directly onto the problem of narrative knowledge management.

### Inferno: Descent into Detail

The *Inferno* is a catalogue of particulars. Dante descends through nine concentric circles, each more specific and more granular than the last, encountering individual sinners with individual stories in individual circumstances. There is no abstraction here — only data points.

In the Scalable Lore Expert, the Inferno layer is the **granular data layer**. It stores individual narrative facts at the highest resolution available: character names, birthdates, and physical descriptions; specific events with episode numbers and timestamps; location coordinates within a fictional geography; exact dialogue quotations with source citations. This layer makes no interpretive claims. It records what happened, to whom, where, and when — and nothing more.

The Inferno layer is implemented as the ingestion and raw storage tier. Structured data (wiki dumps, episode guides, fan databases) and unstructured data (novel text, screenplay dialogue, fan wikis) enter through dedicated connectors and land in a staging area before any transformation occurs. Every fact carries a **provenance record**: where it came from, when it was ingested, what confidence level it carries, and what verification chain connects it to a primary source.

### Purgatorio: Transformation

The *Purgatorio* is the realm of process. Souls do not merely exist there — they are actively transformed. The seven terraces of Mount Purgatory correspond to stages of purification, each one refining the soul further, resolving contradictions, shedding accretions, preparing the essential form for what comes next.

In the system, the Purgatorio layer is the **ETL and transformation layer**. Raw facts from the Inferno undergo entity resolution (is "Monkey D. Luffy" the same entity as "Straw Hat Luffy" and "The Fifth Emperor"?), relationship extraction (what connects this character to that event?), temporal ordering (does this event precede or follow that one?), conflict resolution (two sources disagree about a character's age — which is canonical?), and spoiler classification (at what narrative checkpoint does this fact become safe to reveal?).

This layer is where the ontological work happens. Raw data becomes structured knowledge. Isolated facts become nodes in a graph. The Purgatorio is computationally the most intensive layer and conceptually the most important — it is where the system's understanding of the narrative universe actually forms.

### Paradiso: Ascent to Understanding

The *Paradiso* is the realm of universals. Dante ascends through the celestial spheres and encounters not individuals but principles — justice, temperance, wisdom, love. The particular gives way to the general. The soul that has been purified in Purgatory can now perceive patterns invisible from below.

In the system, the Paradiso layer is the **semantic and analytical layer**. It operates on the structured graph produced by the Purgatorio and enables capabilities that require understanding, not just retrieval: thematic analysis (what narrative themes connect the Impel Down arc to the Marineford arc?), pattern recognition (which character arcs across the entire corpus follow a death-and-rebirth pattern?), cross-narrative comparison (how does the mentor-student relationship in Final Fantasy VII compare to the same archetype in One Piece?), and generative insight (what narrative tensions remain unresolved as of chapter N?).

The Paradiso layer is where vector embeddings, semantic search, and LLM-assisted reasoning operate. Queries at this level are not lookups — they are acts of interpretation. The system does not merely retrieve facts; it synthesizes understanding from the structured knowledge below.

### Recursive Ontology

The three layers are not a pipeline that data flows through once. They form a **recursive loop**. Insights generated at the Paradiso level can trigger re-evaluation at the Purgatorio level (a newly discovered thematic parallel causes the system to re-examine entity relationships) or even new ingestion at the Inferno level (a pattern detected across arcs prompts the system to seek additional source material). This recursive self-refinement is central to Dante's epistemology — understanding is not a destination but an ongoing ascent — and it is central to how the Scalable Lore Expert evolves its knowledge over time.

---

## 2. Solution Overview

The Scalable Lore Expert addresses a specific problem: fictional universes of sufficient complexity (One Piece's 1,100+ chapters, Final Fantasy's 16 mainline entries plus spinoffs, the Marvel Cinematic Universe's 30+ films) generate knowledge corpora that exceed any individual's ability to hold in memory. Existing solutions — fan wikis, episode guides, Reddit threads — are flat, unsearchable by meaning, and indifferent to spoiler boundaries.

### Three-Layer Capabilities

**Layer 1 (Inferno) — Storage and Provenance:**
- Ingest structured and unstructured narrative sources
- Maintain per-fact provenance records with confidence scores
- Support multiple canonical universes (mainline canon, extended canon, non-canon) with explicit hierarchy
- Store raw text alongside structured extractions for auditability

**Layer 2 (Purgatorio) — Transformation and Resolution:**
- Entity resolution across aliases, titles, and naming conventions
- Relationship extraction: character-to-character, character-to-event, event-to-location, artifact-to-theme
- Temporal ordering with support for non-linear narratives (flashbacks, parallel timelines)
- Spoiler classification at episode/volume/chapter granularity
- Conflict resolution with source-priority rules (primary canon overrides secondary)

**Layer 3 (Paradiso) — Semantic Understanding:**
- Natural-language query interface ("What happened to Zoro between Thriller Bark and Sabaody?")
- Thematic clustering and cross-arc pattern detection
- Cross-narrative comparative analysis
- Progressive disclosure with configurable spoiler boundaries
- Confidence-weighted results with citation chains back to primary sources

### Multiverse Logic

The system supports multiple canonical universes simultaneously. Each universe (Final Fantasy VII, One Piece, Elden Ring) is a self-contained graph with its own entity namespace, timeline, and spoiler boundaries. Universes can be linked through explicit cross-reference edges (`is_thematic_parallel_to`, `is_adaptation_of`, `shares_archetype_with`) without collapsing their internal consistency. Canon hierarchy within a single universe distinguishes primary sources (the manga itself) from secondary sources (databooks, interviews) from tertiary sources (fan translations, wiki summaries), and query results respect this hierarchy by default.

---

## 3. Technical Architecture

### Microservices Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          API Gateway                                     │
│          (FastAPI / auth / rate limiting / routing)                       │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────────┤
│          │          │          │          │          │                  │
│  Data    │  Graph   │ Semantic │  Query   │ Spoiler  │  Citation        │
│ Ingest   │ Database │  Search  │ Orchestr │ Filter   │  Tracker         │
│ Service  │ Service  │ Service  │ Service  │ Service  │  Service         │
│          │          │          │          │          │                  │
│ Airflow  │ Neo4j /  │ Pinecone │ Ranking  │ Episode/ │  Provenance     │
│ + Kafka  │ ArangoDB │ Weaviate │ + Merge  │ Volume   │  + Confidence   │
│          │          │ + HNSW   │          │ Markers  │  Scoring        │
└──────┬───┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴──────┬──────────┘
       │        │          │          │          │            │
       ▼        ▼          ▼          ▼          ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Shared Infrastructure                                  │
│   Docker / Kubernetes / Prometheus / Grafana / Redis (cache)             │
└─────────────────────────────────────────────────────────────────────────┘
```

**API Gateway:** FastAPI application handling authentication (JWT), rate limiting (token bucket), request routing, and response aggregation. All client interactions enter through this single endpoint.

**Data Ingestion Service:** Apache Airflow DAGs for batch ingestion (wiki dumps, structured databases) and Apache Kafka consumers for streaming ingestion (real-time updates from monitored sources). Connectors exist for MediaWiki XML exports, structured JSON/CSV, and raw text with configurable chunking strategies.

**Graph Database Service:** Neo4j (primary) or ArangoDB (alternative) storing the entity-relationship graph. Node types: `Character`, `Event`, `Location`, `Group`, `Artifact`, `Theme`, `Arc`, `Universe`. Edge types: `participated_in`, `member_of`, `located_at`, `possesses`, `spoils_in`, `caused`, `is_thematic_parallel_to`, `preceded_by`, `succeeded_by`.

**Semantic Search Service:** Vector embeddings generated via Sentence Transformers (all-MiniLM-L6-v2 for speed, all-mpnet-base-v2 for quality), BERT, or OpenAI ada-002. Stored in Pinecone or Weaviate with HNSW indexing for approximate nearest-neighbor retrieval. Hybrid scoring combines semantic similarity with graph-distance relevance.

**Query Orchestration Service:** Receives parsed natural-language queries, decomposes them into sub-queries (entity lookup + relationship traversal + semantic search), dispatches to appropriate services, merges results, applies ranking, and returns unified responses.

**Spoiler Filtering Service:** Maintains per-universe spoiler boundaries at episode/volume/chapter granularity. Every query carries a spoiler context (e.g., "I have read One Piece through chapter 800") and every result is filtered against that boundary before delivery. Supports progressive disclosure — results are not binary (show/hide) but can be returned with redacted fields and a "contains spoilers beyond chapter X" annotation.

**Citation Tracker Service:** Maintains provenance chains from every assertion back to its source. Each fact carries a confidence score (0.0-1.0) based on source tier, corroboration count, and recency. Query results include citation metadata so users can verify claims.

### Graph Schema

```
(:Character {name, aliases[], universe, first_appearance, status})
    -[:PARTICIPATED_IN {role, chapter_range}]->
(:Event {name, universe, arc, chapter, timestamp_narrative})
    -[:LOCATED_AT]->
(:Location {name, universe, region, coordinates_narrative})

(:Character)-[:MEMBER_OF {joined, left, role}]->(:Group)
(:Character)-[:POSSESSES {acquired, lost}]->(:Artifact)
(:Event)-[:SPOILS_IN {chapter, volume, episode}]->(:SpoilerBoundary)
(:Arc)-[:CONTAINS]->(:Event)
(:Theme)-[:MANIFESTS_IN {strength: float}]->(:Arc)
(:Character)-[:IS_THEMATIC_PARALLEL_TO {dimension}]->(:Character)
```

### Semantic Search Pipeline

1. **Query embedding:** Natural-language query is encoded into a dense vector using the same model that embedded the corpus
2. **Approximate nearest neighbor:** HNSW index returns top-K candidate nodes by cosine similarity
3. **Graph expansion:** For each candidate, traverse 1-2 hops in the graph to gather context (related events, connected characters, containing arcs)
4. **Hybrid scoring:** Final score = `(α × semantic_similarity) + (β × graph_relevance) + (γ × source_confidence)` where α, β, γ are tunable weights
5. **Spoiler filtering:** Remove or redact results that exceed the user's declared spoiler boundary
6. **Citation attachment:** Each result is annotated with provenance metadata and confidence score

---

## 4. Installation and Setup

### Prerequisites

- Python 3.11+
- Docker and Docker Compose (for infrastructure services)
- 8 GB RAM minimum (Neo4j + vector store + API services)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/organvm-i-theoria/scalable-lore-expert.git
cd scalable-lore-expert

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e ".[dev]"

# Start infrastructure (Neo4j, Redis, vector store)
docker compose up -d

# Run database migrations
python -m lore_expert.migrations.setup

# Start the API server
uvicorn lore_expert.gateway.app:app --reload --port 8000
```

### Environment Configuration

```bash
# .env (copy from .env.example)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
VECTOR_STORE=weaviate          # or "pinecone"
WEAVIATE_URL=http://localhost:8080
EMBEDDING_MODEL=all-MiniLM-L6-v2
KAFKA_BOOTSTRAP=localhost:9092
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

### Docker Compose (Full Stack)

```bash
# Start all services including the API
docker compose --profile full up -d

# Verify health
curl http://localhost:8000/health
```

---

## 5. Usage and API

### Natural-Language Queries

```bash
# Simple entity lookup
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Who is Roronoa Zoro?",
    "universe": "one-piece",
    "spoiler_boundary": {"chapter": 800}
  }'

# Temporal range query
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What happened to Luffy between Marineford and Fishman Island?",
    "universe": "one-piece",
    "spoiler_boundary": {"chapter": 653}
  }'

# Thematic analysis
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What themes connect the Impel Down and Marineford arcs?",
    "universe": "one-piece",
    "spoiler_boundary": {"chapter": 600},
    "mode": "thematic"
  }'
```

### Spoiler-Aware Retrieval

Every query accepts a `spoiler_boundary` object that defines the user's current progress. The system guarantees that no result will reveal information beyond that boundary:

```json
{
  "spoiler_boundary": {
    "chapter": 800,
    "include_databooks": true,
    "include_sbs": false
  }
}
```

Results that touch spoiler-sensitive material return with redacted fields:

```json
{
  "character": "Trafalgar D. Water Law",
  "status": "[REDACTED — spoiler beyond chapter 800]",
  "known_aliases": ["Surgeon of Death", "Trafalgar Law"],
  "spoiler_note": "This entity has 3 additional facts beyond your current boundary."
}
```

### Relationship Exploration

```bash
# Find connections between two characters
curl -X POST http://localhost:8000/api/v1/relationships \
  -d '{
    "source": "Monkey D. Luffy",
    "target": "Shanks",
    "universe": "one-piece",
    "max_depth": 3,
    "spoiler_boundary": {"chapter": 1000}
  }'
```

### Cross-Narrative Comparison

```bash
# Compare archetypes across universes
curl -X POST http://localhost:8000/api/v1/compare \
  -d '{
    "query": "How does the mentor-student relationship differ between Cloud/Zack and Luffy/Shanks?",
    "universes": ["final-fantasy-vii", "one-piece"],
    "mode": "comparative"
  }'
```

---

## 6. Working Examples

### Example 1: Character Timeline Reconstruction

**Query:** "Trace Nico Robin's journey from Ohara to joining the Straw Hats."

The system traverses the graph starting from the `Character` node for Nico Robin, follows `PARTICIPATED_IN` edges filtered to events occurring between the Ohara Incident and the Enies Lobby arc, orders results by narrative timestamp, and returns a chronological sequence:

```
1. Ohara Incident (chapter 391-398) — Sole survivor, age 8
2. 20 years of flight — Bounty established, alliance with Crocodile
3. Alabasta Arc (chapters 155-217) — Encounter with Straw Hats
4. Joins crew (chapter 218) — Self-invitation after Alabasta
5. Water 7 / Enies Lobby (chapters 322-430) — Departure and rescue
6. "I want to live!" (chapter 398) — Full commitment to crew
```

Each entry carries citations back to specific chapters and confidence scores based on source tier.

### Example 2: Thematic Clustering

**Query:** "What narrative themes recur across the Final Fantasy series?"

The system queries all `Theme` nodes in the `final-fantasy` universe cluster, aggregates `MANIFESTS_IN` edge weights across all arcs, and returns ranked thematic clusters:

```
Cluster 1: "Resistance to Authority" (strength: 0.91)
  — Manifests in: FF6 (Empire), FF7 (Shinra), FF8 (Galbadia),
    FF10 (Yevon), FF12 (Archadia), FF15 (Niflheim), FF16 (Bearers)

Cluster 2: "Memory and Identity" (strength: 0.87)
  — Manifests in: FF7 (Cloud's false memories), FF8 (GF-induced amnesia),
    FF9 (Vivi's existential questioning), FF10 (dream Zanarkand)

Cluster 3: "Sacrifice and Renewal" (strength: 0.84)
  — Manifests in: FF4 (Palom/Porom), FF6 (Celes), FF7 (Aerith),
    FF10 (Tidus), FF15 (Noctis)
```

### Example 3: Spoiler-Filtered Progressive Disclosure

A user who has read One Piece through chapter 500 asks: "Tell me about the Yonko."

The system returns information available as of chapter 500 — the four Emperors as known at that narrative point — while withholding all developments from chapters 501 onward (the post-timeskip power shifts, new Emperor appointments, defeats). The response notes: "12 additional facts are available beyond your current spoiler boundary."

---

## 7. Research Foundation

### Dante Scholarship

The epistemological framework draws on a tradition of reading the *Commedia* as a structured theory of knowledge, not merely as literary allegory:

- **Charles Singleton**, *Dante Studies* (1954, 1958): Singleton's distinction between the "allegory of poets" and the "allegory of theologians" grounds the system's treatment of narrative facts as simultaneously literal (data) and figurative (semantically meaningful).
- **Robert Hollander**, *Allegory in Dante's Commedia* (1969): Hollander's analysis of Dante's four levels of meaning (literal, allegorical, moral, anagogical) informs the system's multi-layer abstraction model — the same fact exists at different levels of interpretive depth depending on which layer is querying it.
- **John Freccero**, *Dante: The Poetics of Conversion* (1986): Freccero's reading of the *Commedia* as a recursive process of self-understanding provides the theoretical basis for the system's recursive ontology — insights at higher layers trigger re-evaluation at lower layers.

### Knowledge Graph Research

- **Hogan et al.**, "Knowledge Graphs" (ACM Computing Surveys, 2021): Comprehensive survey of graph-based knowledge representation, covering the RDF/property-graph spectrum the system navigates.
- **Ji et al.**, "A Survey on Knowledge Graphs" (Expert Systems with Applications, 2022): Classification of knowledge graph embedding techniques that informs the semantic search pipeline's hybrid scoring approach.
- **Bordes et al.**, "Translating Embeddings for Modeling Multi-relational Data" (NeurIPS, 2013): TransE and its successors provide the mathematical framework for embedding graph relationships into vector space.

### NLP and Semantic Search

- **Reimers & Gurevych**, "Sentence-BERT" (EMNLP, 2019): The Sentence Transformers framework used for query and document embedding.
- **Malkov & Yashunin**, "Efficient and Robust Approximate Nearest Neighbor using Hierarchical Navigable Small World Graphs" (IEEE TPAMI, 2020): HNSW algorithm powering the vector index layer.
- **Lewis et al.**, "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (NeurIPS, 2020): RAG architecture that informs the system's approach to combining retrieval with generative reasoning at the Paradiso layer.

### Narrative Informatics

- **Piper**, *Enumerations: Data and Literary Study* (2018): Computational approaches to literary analysis that inform the system's thematic clustering methodology.
- **Bamman et al.**, "A Bayesian Mixed Effects Model of Literary Character" (ACL, 2014): Character modeling techniques applicable to the entity resolution and characterization pipeline.

---

## 8. Testing and Quality

### Test Architecture

```bash
# Run full test suite
pytest tests/ -v

# Run by layer
pytest tests/inferno/ -v       # Ingestion and storage tests
pytest tests/purgatorio/ -v    # Transformation and resolution tests
pytest tests/paradiso/ -v      # Semantic and analytical tests

# Integration tests (requires Docker services running)
pytest tests/integration/ -v --docker

# Spoiler boundary compliance tests
pytest tests/spoiler/ -v
```

### Quality Gates

- **Entity resolution accuracy:** Measured against hand-labeled alias sets for One Piece (500+ character entries) and Final Fantasy VII (200+ entries). Target: > 95% F1.
- **Spoiler boundary compliance:** Zero-tolerance policy. Every query result is validated against the declared boundary. A single spoiler leak is a test failure.
- **Citation completeness:** Every returned fact must carry a non-empty provenance chain. Uncited facts are filtered from results.
- **Semantic search relevance:** NDCG@10 measured against human-judged relevance sets. Target: > 0.75.

### Linting and Static Analysis

```bash
# Code quality
ruff check src/ tests/
mypy src/ --strict

# Schema validation
python -m lore_expert.validation.schema_check
```

---

## 9. Cross-References

### Within ORGAN-I (Theoria)

This repository connects to several other ORGAN-I projects that provide foundational frameworks:

- **[recursive-engine--generative-entity](https://github.com/organvm-i-theoria/recursive-engine--generative-entity):** The recursive ontology model (Inferno-Purgatorio-Paradiso loop) draws on the recursive self-reference formalism developed in RE:GE. The Scalable Lore Expert is a domain-specific application of recursive symbolic processing.
- **[organon-noumenon--ontogenetic-morphe](https://github.com/organvm-i-theoria/organon-noumenon--ontogenetic-morphe):** The ontological layering (raw data / structured knowledge / semantic understanding) parallels the noumenal-phenomenal distinction in Ontogenetic Morphe. The 22-subsystem architecture informs the service decomposition.
- **[narratological-algorithmic-lenses](https://github.com/organvm-i-theoria/narratological-algorithmic-lenses):** The thematic analysis and arc-pattern detection capabilities build on the 14 narratological frameworks and 92 algorithms formalized in this sibling project. Where narratological-algorithmic-lenses provides the general theory, Scalable Lore Expert provides the domain-specific application.
- **[linguistic-atomization-framework](https://github.com/organvm-i-theoria/linguistic-atomization-framework):** The text chunking and atomization strategies used in the ingestion pipeline derive from LingFrame's hierarchical decomposition methodology.
- **[my-knowledge-base](https://github.com/organvm-i-theoria/my-knowledge-base):** Shared vector search and semantic embedding patterns. Both systems use similar embedding-and-retrieve architectures, though applied to different knowledge domains (conversational knowledge vs. narrative lore).

### System Context

The Scalable Lore Expert is a pure ORGAN-I project: it formalizes an epistemological framework (Dante's tripartite knowledge model) and applies it to a knowledge management domain (narrative universes). It does not depend on any ORGAN-II or ORGAN-III project, respecting the system's no-back-edges invariant. However, the interactive exploration interface (query UI, visualization) is a natural candidate for ORGAN-II promotion if the project reaches CANDIDATE status.

---

## 10. Contributing

Contributions are welcome. Areas where help is particularly valuable:

- **Universe connectors:** New ingestion connectors for specific fictional universes (Tolkien, Star Wars, Cosmere, Warhammer 40K)
- **Entity resolution:** Improved alias detection for non-English-origin character names (Japanese romanization variants, localization differences)
- **Graph schema extensions:** Additional node types (Power, Ability, Prophecy, Political Entity) and edge types for richer modeling
- **Spoiler boundary standards:** Research into granularity levels beyond chapter/episode (scene-level, panel-level for manga)
- **Embedding experiments:** Comparative evaluation of embedding models for narrative text (domain-specific fine-tuning, multilingual models)
- **Visualization:** Graph visualization tools for exploring entity relationships and thematic clusters

Please open an issue before submitting large changes to discuss the approach. All contributions must include tests and maintain spoiler boundary compliance.

---

## 11. License and Author

[MIT](LICENSE) — Anthony Padavano

**Anthony Padavano** ([@4444j99](https://github.com/4444j99))

Part of the [ORGAN-I: Theoria](https://github.com/organvm-i-theoria) epistemological foundations layer within the [eight-organ system](https://github.com/meta-organvm).

### The Eight-Organ System

| Organ | Domain | GitHub Organization |
|-------|--------|-------------------|
| **I** | **Theory (Theoria)** | **[organvm-i-theoria](https://github.com/organvm-i-theoria)** |
| II | Art (Poiesis) | [organvm-ii-poiesis](https://github.com/organvm-ii-poiesis) |
| III | Commerce (Ergon) | [organvm-iii-ergon](https://github.com/organvm-iii-ergon) |
| IV | Orchestration (Taxis) | [organvm-iv-taxis](https://github.com/organvm-iv-taxis) |
| V | Public Process (Logos) | [organvm-v-logos](https://github.com/organvm-v-logos) |
| VI | Community (Koinonia) | [organvm-vi-koinonia](https://github.com/organvm-vi-koinonia) |
| VII | Marketing (Kerygma) | [organvm-vii-kerygma](https://github.com/organvm-vii-kerygma) |
| Meta | Governance | [meta-organvm](https://github.com/meta-organvm) |

---

*Scalable Lore Expert System is part of the ORGAN-I epistemological research layer — formalizing how knowledge is structured, layered, and recursively refined.*
