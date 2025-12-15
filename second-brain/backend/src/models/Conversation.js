import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  sources: [{
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    title: String,
    excerpt: String,
    relevance: Number
  }],
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  messages: [messageSchema],
  title: { type: String, default: 'New Conversation' }
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);

