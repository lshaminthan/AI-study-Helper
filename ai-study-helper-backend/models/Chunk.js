const mongoose = require('mongoose');

// A piece of a study session's content plus its embedding vector (the RAG knowledge base)
const chunkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  studySessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudySession',
    required: true,
    index: true
  },
  source: {
    type: String,
    enum: ['notes', 'summary', 'explanations'],
    required: true
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chunk', chunkSchema);
