import express from 'express';
import multer from 'multer';
import Document from '../models/Document.js';
import { processFile, scrapeWebContent } from '../services/ingestionService.js';
import { chunkText } from '../services/chunkerService.js';
import { getEmbeddings } from '../services/embeddingService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    
    const { title, contentType = 'document', tags = '' } = req.body;
    const { text, metadata } = await processFile(req.file.buffer, req.file.originalname, contentType);
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'No text content extracted from file' });
    }
    
    const chunks = chunkText(text);
    if (!chunks.length) return res.status(400).json({ error: 'Failed to chunk the content' });
    
    const embeddings = await getEmbeddings(chunks);
    
    const document = new Document({
      title: title || req.file.originalname,
      contentType: contentType,
      source: req.file.originalname,
      originalContent: text,
      chunks: chunks.map((content, i) => ({ content, embedding: embeddings[i], chunkIndex: i })),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      metadata: { fileSize: req.file.size, mimeType: req.file.mimetype, ...metadata }
    });
    
    await document.save();
    res.json({ success: true, documentId: document._id, message: `Successfully ingested ${req.file.originalname}`, chunksCreated: chunks.length });
  } catch (error) {
    console.error('File ingestion error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/url', async (req, res) => {
  try {
    const { url, title, tags = [] } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    const { text, title: extractedTitle } = await scrapeWebContent(url);
    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'No text content extracted from URL' });
    
    const chunks = chunkText(text);
    if (!chunks.length) return res.status(400).json({ error: 'Failed to chunk the content' });
    
    const embeddings = await getEmbeddings(chunks);
    
    const document = new Document({
      title: title || extractedTitle || url,
      contentType: 'web',
      source: url,
      originalContent: text,
      chunks: chunks.map((content, i) => ({ content, embedding: embeddings[i], chunkIndex: i })),
      tags: Array.isArray(tags) ? tags : []
    });
    
    await document.save();
    res.json({ success: true, documentId: document._id, message: `Successfully ingested URL: ${url}`, chunksCreated: chunks.length });
  } catch (error) {
    console.error('URL ingestion error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/text', async (req, res) => {
  try {
    const { text, title = 'Text Note', tags = [] } = req.body;
    if (!text) return res.status(400).json({ error: 'Text content is required' });
    
    const chunks = chunkText(text);
    if (!chunks.length) return res.status(400).json({ error: 'Failed to chunk the content' });
    
    const embeddings = await getEmbeddings(chunks);
    
    const document = new Document({
      title,
      contentType: 'text',
      source: 'direct_input',
      originalContent: text,
      chunks: chunks.map((content, i) => ({ content, embedding: embeddings[i], chunkIndex: i })),
      tags: Array.isArray(tags) ? tags : []
    });
    
    await document.save();
    res.json({ success: true, documentId: document._id, message: 'Successfully ingested text content', chunksCreated: chunks.length });
  } catch (error) {
    console.error('Text ingestion error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

