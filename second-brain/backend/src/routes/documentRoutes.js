import express from 'express';
import { getAllDocuments, getDocumentById, deleteDocument, getDocumentCount } from '../services/retrievalService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const documents = await getAllDocuments();
    res.json({ documents, total: documents.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/count', async (req, res) => {
  try {
    const count = await getDocumentCount();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const document = await getDocumentById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const success = await deleteDocument(req.params.id);
    if (success) res.json({ message: `Document ${req.params.id} deleted successfully` });
    else res.status(404).json({ error: 'Document not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

