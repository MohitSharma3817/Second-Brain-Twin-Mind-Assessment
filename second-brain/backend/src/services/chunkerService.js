const MAX_CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export const chunkText = (text, chunkSize = MAX_CHUNK_SIZE, overlap = CHUNK_OVERLAP) => {
  text = text.replace(/\s+/g, ' ').trim();
  
  if (text.length <= chunkSize) {
    return text ? [text] : [];
  }
  
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= chunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  
  if (overlap > 0 && chunks.length > 1) {
    const overlappedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      if (i > 0) {
        const prevWords = chunks[i - 1].split(' ').slice(-Math.floor(overlap / 10));
        overlappedChunks.push(prevWords.join(' ') + ' ' + chunks[i]);
      } else {
        overlappedChunks.push(chunks[i]);
      }
    }
    return overlappedChunks;
  }
  
  return chunks;
};

