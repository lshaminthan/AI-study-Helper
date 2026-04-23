const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { isAuthenticated } = require('../middleware/auth');
const visionService = require('../services/visionService');
const geminiService = require('../services/geminiService');
const youtubeService = require('../services/youtubeService');
const ragService = require('../services/ragService');
const StudySession = require('../models/StudySession');
const User = require('../models/User');
const Helpers = require('../utils/helpers');

// Ensure uploads directory exists
Helpers.ensureUploadsDirectory();

// Upload and analyze image
router.post('/analyze', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(Helpers.formatResponse(false, null, 'No image file provided'));
    }

    if (!req.body.prompt) {
      return res.status(400).json(Helpers.formatResponse(false, null, 'User prompt is required'));
    }

    const imagePath = req.file.path;
    const userPrompt = req.body.prompt;
    const imageUrl = `/uploads/${req.file.filename}`;

    let ocrText = '';
    let analysisResult;

    // Step 1: Extract text using Google Vision API (for all image types)
    try {
      ocrText = await visionService.extractTextFromImage(imagePath);
    } catch (error) {
      console.warn('OCR extraction failed:', error.message);
    }

    // Step 2: Classify image type
    const imageType = Helpers.classifyImageType(ocrText, userPrompt);

    // Step 3: Analyze based on image type
    if (imageType === 'diagram') {
      // For diagrams: use both Vision API (already done) and Gemini Vision API
      analysisResult = await geminiService.analyzeDiagram(imagePath, userPrompt);
    } else {
      // For textbooks and handwritten notes: use OCR text with Gemini
      analysisResult = await geminiService.analyzeContent(ocrText, userPrompt, imageType);
    }

    // Step 4: Get YouTube video suggestions
    let youtubeVideos = [];
    if (analysisResult.youtubeSearchTerms && analysisResult.youtubeSearchTerms.length > 0) {
      youtubeVideos = await youtubeService.searchVideos(analysisResult.youtubeSearchTerms);
    }

    // Step 5: Create study session
    const sessionTitle = Helpers.generateSessionTitle(userPrompt, ocrText);

    const studySession = new StudySession({
      userId: req.user._id,
      title: sessionTitle,
      imageUrl: imageUrl,
      imageType: imageType,
      userPrompt: userPrompt,
      ocrText: Helpers.cleanText(ocrText),
      analysis: {
        summary: analysisResult.summary || '',
        explanations: analysisResult.explanations || '',
        quizQuestions: analysisResult.quizQuestions || [],
        flashcards: analysisResult.flashcards || [],
        youtubeVideos: youtubeVideos,
        mindMap: analysisResult.mindMap || ''
      }
    });

    await studySession.save();

    // Step 6: Chunk and embed the content so the chatbot can retrieve from it (RAG)
    await ragService.safeIndexSession(studySession);

    // Update user's study sessions
    await User.findByIdAndUpdate(req.user._id, {
      $push: { studySessions: studySession._id }
    });

    res.json(Helpers.formatResponse(true, studySession, 'Image analyzed successfully'));

  } catch (error) {
    console.error('Upload and analysis error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to analyze image', error.message));
  }
});

// Get user's study sessions
router.get('/sessions', isAuthenticated, async (req, res) => {
  try {
    const studySessions = await StudySession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(Helpers.formatResponse(true, studySessions, 'Study sessions retrieved successfully'));
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to retrieve study sessions'));
  }
});

// Get specific study session
router.get('/sessions/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const studySession = await StudySession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    }).populate('chatMessages');

    if (!studySession) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Study session not found'));
    }

    res.json(Helpers.formatResponse(true, studySession, 'Study session retrieved successfully'));
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to retrieve study session'));
  }
});

// Delete study session
router.delete('/sessions/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const studySession = await StudySession.findOneAndDelete({
      _id: req.params.sessionId,
      userId: req.user._id
    });

    if (!studySession) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Study session not found'));
    }

    // Remove its RAG chunks
    await ragService.deleteSessionChunks(studySession._id);

    // Remove from user's study sessions
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { studySessions: req.params.sessionId }
    });

    res.json(Helpers.formatResponse(true, null, 'Study session deleted successfully'));
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to delete study session'));
  }
});

module.exports = router;