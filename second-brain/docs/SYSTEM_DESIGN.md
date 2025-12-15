# Second Brain: System Design Document

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  React Frontend (Vite)                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ Chat UI    │  │ Upload     │  │ Sidebar    │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Express.js REST API                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ /ingest    │  │ /query     │  │ /documents │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │ Ingestion │ │ Chunking  │ │ Embedding │ │ Retrieval │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
│  ┌───────────┐                                                  │
│  │ LLM       │                                                  │
│  └───────────┘                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│       DATA LAYER        │   │    EXTERNAL SERVICES    │
│  ┌───────────────────┐ │   │  ┌───────────────────┐ │
│  │     MongoDB       │ │   │  │  Google Gemini    │ │
│  │  - Documents      │ │   │  │  - Embeddings     │ │
│  │  - Chunks         │ │   │  │  - Gemini Flash   │ │
│  │  - Embeddings     │ │   │  │  - Audio Trans.   │ │
│  └───────────────────┘ │   │  └───────────────────┘ │
└─────────────────────────┘   └─────────────────────────┘
```

## 2. Multi-Modal Data Ingestion Pipeline

### 2.1 Supported Modalities

| Modality | Formats | Processing Method |
|----------|---------|-------------------|
| Audio | MP3, M4A, WAV, OGG, FLAC | Gemini 1.5 Flash transcription |
| Documents | PDF | pdf-parse library |
| Documents | MD, TXT | Direct text reading |
| Web Content | URLs | Cheerio for scraping |
| Plain Text | Direct input | Stored as-is |

### 2.2 Processing Flow

1. Input Reception: File/URL/Text received via API
2. Type Detection: Content type determined from file extension
3. Content Extraction: Appropriate processor extracts text
4. Chunking: Text split into semantic chunks (500 chars, 50 overlap)
5. Embedding Generation: Gemini text-embedding-004
6. Storage: Document + chunks + embeddings stored in MongoDB

## 3. Information Retrieval & Querying Strategy

### 3.1 Semantic Search with Vector Embeddings

We use semantic search as the primary retrieval strategy.

**Why Semantic Search?**
- Users rarely remember exact phrases from documents
- Questions like "What were the key concerns?" require understanding context
- Vector similarity captures meaning, not just words

### 3.2 Similarity Calculation

```javascript
cosineSimilarity(vecA, vecB) = (A · B) / (||A|| × ||B||)
```

Results ranked by similarity score (0-1).

## 4. Data Indexing & Storage Model

### 4.1 Database Schema

```javascript
{
  _id: ObjectId,
  title: String,
  contentType: ['audio', 'document', 'web', 'text', 'image'],
  source: String,
  originalContent: String,
  chunks: [{
    content: String,
    embedding: [Number],  // 768-dim vector (Gemini)
    chunkIndex: Number
  }],
  tags: [String],
  metadata: {
    fileSize: Number,
    mimeType: String,
    duration: Number,
    pageCount: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Why MongoDB?

- Flexible document structure for various content types
- Native support for embedded arrays (chunks + embeddings)
- Easy to self-host or use Atlas
- Rich query capabilities for filtering

## 5. Temporal Querying Support

### 5.1 Time-Based Data Association

Every document automatically receives timestamps:
- `createdAt`: When ingested
- `updatedAt`: When modified

### 5.2 Temporal Query Parsing

| Query | Parsed Filter |
|-------|---------------|
| "last 3 days" | `createdAt >= now - 3 days` |
| "this week" | `createdAt >= start of week` |
| "last month" | `createdAt >= now - 30 days` |
| "yesterday" | `createdAt >= yesterday 00:00` |

## 6. Scalability & Privacy

### 6.1 Scaling Strategies

| Scale | Strategy |
|-------|----------|
| 100-1000 docs | Single MongoDB instance |
| 1000-10000 docs | MongoDB Atlas + pagination |
| 10000+ docs | Dedicated vector DB (Pinecone) |

### 6.2 Privacy Considerations

**Cloud Approach:**
- Easy deployment
- Data sent to Google Gemini for processing

**Local-First Alternative:**
- Full privacy with local LLM (Ollama)
- Requires GPU for performance

## 7. Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | React + Vite | Fast dev, excellent DX |
| Styling | Tailwind CSS | Rapid UI development |
| Backend | Node.js + Express | JavaScript ecosystem |
| Database | MongoDB | Flexible schema |
| Embeddings | Gemini text-embedding-004 | High quality, free tier |
| LLM | Gemini 1.5 Flash | Fast, accurate, generous free tier |
| Audio | Gemini 1.5 Flash | Multimodal transcription |

## 8. Why Google Gemini?

1. **Generous Free Tier**: 15 RPM for free, sufficient for development
2. **Multimodal**: Single API for text, embeddings, and audio
3. **Fast**: Gemini Flash optimized for speed
4. **Cost-Effective**: Much cheaper than alternatives at scale
5. **Easy Integration**: Simple SDK for Node.js
