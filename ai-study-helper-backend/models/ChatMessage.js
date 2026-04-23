const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  studySessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudySession',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  mindMap: {
    type: String
  },
  // 'session' = searched this study session, 'all' = searched all of the user's notes
  scope: {
    type: String,
    enum: ['session', 'all'],
    default: 'session'
  },
  // Chunks retrieved by RAG and used to generate the response
  sources: [{
    studySessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySession'
    },
    sessionTitle: String,
    source: String,
    text: String,
    score: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);