const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageType: {
    type: String,
    enum: ['handwritten', 'textbook', 'diagram'],
    required: true
  },
  userPrompt: {
    type: String,
    required: true
  },
  ocrText: {
    type: String
  },
  analysis: {
    summary: String,
    explanations: String,
    quizQuestions: [{
      type: { type: String },
      question: String,
      options: [String],
      correctAnswer: String
    }],
    flashcards: [{
      front: String,
      back: String
    }],
    youtubeVideos: [{
      title: String,
      videoId: String,
      thumbnail: String,
      views: String,
      url: String,
      channelTitle: String,
      description: String
    }],
    mindMap: String
  },
  chatMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  }],
  // Set when this session's content has been chunked and embedded for RAG
  ragIndexedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudySession', studySessionSchema);