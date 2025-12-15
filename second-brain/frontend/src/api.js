import axios from 'axios';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await axios.get('/');
    return res.data;
  },
  async getDocuments() {
    const res = await axios.get(`${API_BASE}/documents`);
    return res.data;
  },
  async deleteDocument(id) {
    const res = await axios.delete(`${API_BASE}/documents/${id}`);
    return res.data;
  },
  async ingestFile(file, title, contentType, tags) {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    formData.append('contentType', contentType);
    if (tags) formData.append('tags', tags);
    const res = await axios.post(`${API_BASE}/ingest/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  async ingestUrl(url, title, tags) {
    const res = await axios.post(`${API_BASE}/ingest/url`, { url, title, tags });
    return res.data;
  },
  async ingestText(text, title, tags) {
    const res = await axios.post(`${API_BASE}/ingest/text`, { text, title, tags });
    return res.data;
  },
  async query(query, options = {}) {
    const res = await axios.post(`${API_BASE}/query`, { query, ...options });
    return res.data;
  }
};

