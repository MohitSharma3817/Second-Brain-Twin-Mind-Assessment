# Second Brain - AI Knowledge Companion

A personal AI companion that ingests, understands, and reasons about your information using the MERN stack with Google Gemini AI.

## Features

- Multi-Modal Ingestion: Upload PDFs, audio files, web URLs, or plain text
- Semantic Search: Find relevant information by meaning, not just keywords
- Temporal Queries: Ask "What did I work on last week?"
- Streaming Responses: Real-time AI responses
- Beautiful UI: Modern, responsive chat interface

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI**: Google Gemini (Embeddings, Gemini 1.5 Flash, Audio Transcription)

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key (get from https://aistudio.google.com/apikey)

### 1. Backend Setup

```bash
cd second-brain/backend
npm install

# Edit .env file with your Gemini API key:
# MONGODB_URI=mongodb://localhost:27017/secondbrain
# GEMINI_API_KEY=your_gemini_api_key_here
# PORT=5000

npm run dev
```

### 2. Frontend Setup

```bash
cd second-brain/frontend
npm install
npm run dev
```

### 3. Open the App

Visit `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/ingest/file` | Upload file |
| POST | `/api/ingest/url` | Ingest web page |
| POST | `/api/ingest/text` | Ingest text |
| POST | `/api/query` | Query knowledge base |
| POST | `/api/query/stream` | Streaming query |
| GET | `/api/documents` | List documents |
| DELETE | `/api/documents/:id` | Delete document |

## Supported File Types

- **Audio**: MP3, M4A, WAV, OGG, FLAC (transcribed via Gemini)
- **Documents**: PDF, MD, TXT
- **Web**: Any URL

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/secondbrain
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```
