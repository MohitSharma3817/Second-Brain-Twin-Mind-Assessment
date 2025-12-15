import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import pdf from 'pdf-parse/lib/pdf-parse.js';

let genAI = null;

const getClient = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

export const transcribeAudio = async (buffer, filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'mp3': 'audio/mp3',
    'm4a': 'audio/mp4',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac'
  };
  
  const mimeType = mimeTypes[ext] || 'audio/mp3';
  const base64Audio = buffer.toString('base64');
  
  const model = getClient().getGenerativeModel({ model: 'gemma-3-4b-it' });
  
  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mimeType,
        data: base64Audio
      }
    },
    { text: 'Please transcribe this audio file. Provide only the transcription, no additional commentary.' }
  ]);
  
  return result.response.text();
};

export const extractPdfText = async (buffer) => {
  const data = await pdf(buffer);
  return { text: data.text, pageCount: data.numpages };
};

export const extractMarkdownText = (buffer) => {
  return buffer.toString('utf-8');
};

export const scrapeWebContent = async (url) => {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 30000
  });
  
  const $ = cheerio.load(response.data);
  $('script, style, nav, footer, header, aside, .ads, .advertisement').remove();
  
  const title = $('title').text() || $('h1').first().text() || url;
  let text = '';
  $('article, main, .content, .post, body').each((_, el) => {
    text += $(el).text() + ' ';
  });
  
  text = text.replace(/\s+/g, ' ').trim();
  if (!text) text = $('body').text().replace(/\s+/g, ' ').trim();
  
  return { text, title: title.trim() };
};

export const processFile = async (buffer, filename, contentType) => {
  const ext = filename.split('.').pop().toLowerCase();
  
  if (contentType === 'audio' || ['mp3', 'm4a', 'wav', 'ogg', 'flac'].includes(ext)) {
    const text = await transcribeAudio(buffer, filename);
    return { text, metadata: { type: 'audio' } };
  }
  
  if (ext === 'pdf') {
    const { text, pageCount } = await extractPdfText(buffer);
    return { text, metadata: { type: 'document', pageCount } };
  }
  
  if (['md', 'markdown'].includes(ext)) {
    const text = extractMarkdownText(buffer);
    return { text, metadata: { type: 'document' } };
  }
  
  if (['txt', 'text'].includes(ext)) {
    const text = buffer.toString('utf-8');
    return { text, metadata: { type: 'text' } };
  }
  
  try {
    const text = buffer.toString('utf-8');
    return { text, metadata: { type: 'text' } };
  } catch {
    throw new Error(`Unsupported file type: ${ext}`);
  }
};
