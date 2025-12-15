import Document from '../models/Document.js';
import { getEmbedding, cosineSimilarity } from './embeddingService.js';

const parseTimeFilter = (timeFilter) => {
  if (!timeFilter) return null;
  
  const now = new Date();
  const lower = timeFilter.toLowerCase();
  
  const patterns = [
    { regex: /last (\d+) day/i, handler: (m) => new Date(now - parseInt(m[1]) * 24 * 60 * 60 * 1000) },
    { regex: /last (\d+) week/i, handler: (m) => new Date(now - parseInt(m[1]) * 7 * 24 * 60 * 60 * 1000) },
    { regex: /last (\d+) month/i, handler: (m) => new Date(now - parseInt(m[1]) * 30 * 24 * 60 * 60 * 1000) },
    { regex: /today/i, handler: () => new Date(now.setHours(0, 0, 0, 0)) },
    { regex: /yesterday/i, handler: () => new Date(now - 24 * 60 * 60 * 1000) },
    { regex: /this week/i, handler: () => new Date(now - now.getDay() * 24 * 60 * 60 * 1000) },
    { regex: /this month/i, handler: () => new Date(now.getFullYear(), now.getMonth(), 1) },
    { regex: /last week/i, handler: () => new Date(now - 7 * 24 * 60 * 60 * 1000) },
    { regex: /last month/i, handler: () => new Date(now - 30 * 24 * 60 * 60 * 1000) }
  ];
  
  for (const { regex, handler } of patterns) {
    const match = lower.match(regex);
    if (match) return handler(match);
  }
  
  return null;
};

export const searchDocuments = async (query, options = {}) => {
  const { limit = 5, timeFilter = null, contentTypes = null } = options;
  
  const queryEmbedding = await getEmbedding(query);
  
  let filter = {};
  if (contentTypes && contentTypes.length > 0) {
    filter.contentType = { $in: contentTypes };
  }
  
  const timeThreshold = parseTimeFilter(timeFilter);
  if (timeThreshold) {
    filter.createdAt = { $gte: timeThreshold };
  }
  
  const documents = await Document.find(filter).lean();
  const results = [];
  
  for (const doc of documents) {
    for (const chunk of doc.chunks) {
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      results.push({
        documentId: doc._id,
        title: doc.title,
        contentType: doc.contentType,
        source: doc.source,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        relevance: similarity,
        createdAt: doc.createdAt
      });
    }
  }
  
  results.sort((a, b) => b.relevance - a.relevance);
  return results.slice(0, limit);
};

export const getDocumentById = async (id) => {
  return await Document.findById(id);
};

export const getAllDocuments = async () => {
  return await Document.find({})
    .select('title contentType source tags createdAt chunks')
    .sort({ createdAt: -1 })
    .lean()
    .then(docs => docs.map(doc => ({
      ...doc,
      chunkCount: doc.chunks?.length || 0,
      chunks: undefined
    })));
};

export const deleteDocument = async (id) => {
  const result = await Document.findByIdAndDelete(id);
  return !!result;
};

export const getDocumentCount = async () => {
  return await Document.countDocuments();
};

