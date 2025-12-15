import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

const getClient = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const SYSTEM_PROMPT = `You are a helpful AI assistant that serves as a "second brain" for the user. 
You have access to the user's personal knowledge base containing documents, transcripts, web articles, and notes.

Your role is to:
1. Answer questions based on the provided context from the user's knowledge base
2. Synthesize information from multiple sources when relevant
3. Be concise but comprehensive in your responses
4. Cite the sources when providing information
5. If the context doesn't contain relevant information, say so honestly

Always prioritize accuracy over speculation.`;

const formatContext = (documents) => {
  if (!documents || documents.length === 0) {
    return 'No relevant documents found in the knowledge base.';
  }
  
  return documents.map((doc, i) => {
    const sourceInfo = `[Source ${i + 1}: ${doc.title} (${doc.contentType}) - ${new Date(doc.createdAt).toLocaleDateString()}]`;
    return `${sourceInfo}\n${doc.content}`;
  }).join('\n\n---\n\n');
};

export const generateAnswer = async (query, contextDocuments) => {
  const context = formatContext(contextDocuments);
  
  const userMessage = `${SYSTEM_PROMPT}

Based on the following context from my knowledge base, please answer my question.

CONTEXT:
${context}

QUESTION: ${query}

Please provide a comprehensive answer based on the context above. If the context doesn't contain enough information, let me know.`;

  const model = getClient().getGenerativeModel({ model: 'gemma-3-4b-it' });
  const result = await model.generateContent(userMessage);
  return result.response.text();
};

export const generateAnswerStream = async function* (query, contextDocuments) {
  const context = formatContext(contextDocuments);
  
  const userMessage = `${SYSTEM_PROMPT}

Based on the following context from my knowledge base, please answer my question.

CONTEXT:
${context}

QUESTION: ${query}

Please provide a comprehensive answer based on the context above. If the context doesn't contain enough information, let me know.`;

  const model = getClient().getGenerativeModel({ model: 'gemma-3-4b-it' });
  const result = await model.generateContentStream(userMessage);
  
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
};
