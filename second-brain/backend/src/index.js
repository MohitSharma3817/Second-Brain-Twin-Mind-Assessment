import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import ingestRoutes from './routes/ingestRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', async (req, res) => {
  const Document = (await import('./models/Document.js')).default;
  const count = await Document.countDocuments();
  res.json({ status: 'healthy', version: '1.0.0', documentsCount: count });
});

app.use('/api/ingest', ingestRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/documents', documentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

