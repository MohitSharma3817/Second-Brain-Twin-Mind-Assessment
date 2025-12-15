import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

const getClient = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

export const getEmbedding = async (text) => {
  const model = getClient().getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
};

export const getEmbeddings = async (texts) => {
  const model = getClient().getGenerativeModel({ model: 'text-embedding-004' });
  const embeddings = [];
  
  for (const text of texts) {
    const result = await model.embedContent(text);
    embeddings.push(result.embedding.values);
  }
  
  return embeddings;
};

export const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
