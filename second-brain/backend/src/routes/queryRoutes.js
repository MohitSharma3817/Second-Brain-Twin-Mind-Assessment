import express from 'express';
import { searchDocuments } from '../services/retrievalService.js';
import { generateAnswer, generateAnswerStream } from '../services/llmService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { query, timeFilter, contentTypes, limit = 5 } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    
    const startTime = Date.now();
    const relevantDocs = await searchDocuments(query, { limit, timeFilter, contentTypes });
    const answer = await generateAnswer(query, relevantDocs);
    
    const sources = relevantDocs.map(doc => ({
      title: doc.title,
      contentType: doc.contentType,
      source: doc.source,
      timestamp: doc.createdAt,
      relevance: doc.relevance,
      excerpt: doc.content.length > 200 ? doc.content.substring(0, 200) + '...' : doc.content
    }));
    
    res.json({ answer, sources, queryTime: (Date.now() - startTime) / 1000 });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/stream', async (req, res) => {
  try {
    const { query, timeFilter, contentTypes, limit = 5 } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    
    const relevantDocs = await searchDocuments(query, { limit, timeFilter, contentTypes });
    
    const sources = relevantDocs.map(doc => ({
      title: doc.title,
      contentType: doc.contentType,
      source: doc.source,
      timestamp: doc.createdAt,
      relevance: doc.relevance
    }));
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    res.write(`data: ${JSON.stringify({ type: 'sources', data: sources })}\n\n`);
    
    for await (const token of generateAnswerStream(query, relevantDocs)) {
      res.write(`data: ${JSON.stringify({ type: 'token', data: token })}\n\n`);
    }
    
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Stream query error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', data: error.message })}\n\n`);
    res.end();
  }
});

export default router;

