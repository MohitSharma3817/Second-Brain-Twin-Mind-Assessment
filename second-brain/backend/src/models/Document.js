import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema({
  content: { type: String, required: true },
  embedding: { type: [Number], required: true },
  chunkIndex: { type: Number, required: true }
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  contentType: { 
    type: String, 
    enum: ['audio', 'document', 'web', 'text', 'image'],
    required: true 
  },
  source: { type: String, required: true },
  originalContent: { type: String },
  chunks: [chunkSchema],
  tags: [{ type: String }],
  metadata: {
    fileSize: Number,
    mimeType: String,
    duration: Number,
    pageCount: Number
  }
}, { timestamps: true });

documentSchema.index({ createdAt: -1 });
documentSchema.index({ contentType: 1 });

export default mongoose.model('Document', documentSchema);

