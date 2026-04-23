const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const youtubeService = require('../services/youtubeService');
const ragService = require('../services/ragService');
const StudySession = require('../models/StudySession');
const Helpers = require('../utils/helpers');

// Regenerate analysis for existing study session
router.post('/regenerate/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const { prompt } = req.body;

    const studySession = await StudySession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });

    if (!studySession) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Study session not found'));
    }

    // Use new prompt or existing one
    const analysisPrompt = prompt || studySession.userPrompt;

    let analysisResult;

    if (studySession.imageType === 'diagram') {
      // For diagrams, we need the image path (reconstruct it)
      const imagePath = `uploads/${studySession.imageUrl.split('/').pop()}`;
      analysisResult = await geminiService.analyzeDiagram(imagePath, analysisPrompt);
    } else {
      analysisResult = await geminiService.analyzeContent(studySession.ocrText, analysisPrompt, studySession.imageType);
    }

    // Get new YouTube video suggestions
    let youtubeVideos = [];
    if (analysisResult.youtubeSearchTerms && analysisResult.youtubeSearchTerms.length > 0) {
      youtubeVideos = await youtubeService.searchVideos(analysisResult.youtubeSearchTerms);
    }

    // Update study session
    studySession.analysis = {
      summary: analysisResult.summary || '',
      explanations: analysisResult.explanations || '',
      quizQuestions: analysisResult.quizQuestions || [],
      flashcards: analysisResult.flashcards || [],
      youtubeVideos: youtubeVideos,
      mindMap: analysisResult.mindMap || ''
    };

    if (prompt) {
      studySession.userPrompt = prompt;
    }

    await studySession.save();

    // Summary and explanations changed, so refresh the RAG index
    await ragService.safeIndexSession(studySession);

    res.json(Helpers.formatResponse(true, studySession, 'Analysis regenerated successfully'));

  } catch (error) {
    console.error('Regenerate analysis error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to regenerate analysis', error.message));
  }
});

// Generate additional quiz questions
router.post('/generate-quiz/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const { questionType, count = 5 } = req.body;

    const studySession = await StudySession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });

    if (!studySession) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Study session not found'));
    }

    const quizPrompt = `
      Based on the following content, generate ${count} ${questionType || 'multiple-choice'} questions:

      Content: ${studySession.ocrText}
      Previous Analysis: ${studySession.analysis.summary}

      Return ONLY a JSON array of questions in this format:
      [
        {
          "type": "${questionType || 'multiple-choice'}",
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A"
        }
      ]
    `;

    const response = await geminiService.answerQuestion(quizPrompt, studySession.ocrText, studySession.analysis);

    let newQuestions;
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      newQuestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (parseError) {
      newQuestions = [];
    }

    res.json(Helpers.formatResponse(true, newQuestions, 'Additional quiz questions generated'));

  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to generate quiz questions'));
  }
});

// Get mind map for session
router.get('/mindmap/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const studySession = await StudySession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });

    if (!studySession) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Study session not found'));
    }

    if (studySession.analysis.mindMap) {
      res.json(Helpers.formatResponse(true, { mindMap: studySession.analysis.mindMap }));
    } else {
      // Generate mind map if not exists
      const mindMapPrompt = `
        Create a detailed mind map for the following content. Return it as a structured text with proper indentation:

        Content: ${studySession.ocrText}
        Summary: ${studySession.analysis.summary}

        Format as hierarchical text with indentation to show relationships.
      `;

      const mindMap = await geminiService.answerQuestion(mindMapPrompt, studySession.ocrText, studySession.analysis);

      // Save the generated mind map
      studySession.analysis.mindMap = mindMap;
      await studySession.save();

      res.json(Helpers.formatResponse(true, { mindMap }));
    }

  } catch (error) {
    console.error('Get mindmap error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to retrieve mind map'));
  }
});

// Search YouTube videos for specific terms
router.post('/youtube-search', isAuthenticated, async (req, res) => {
  try {
    const { searchTerms, maxResults = 6 } = req.body;

    if (!searchTerms || searchTerms.length === 0) {
      return res.status(400).json(Helpers.formatResponse(false, null, 'Search terms are required'));
    }

    const videos = await youtubeService.searchVideos(searchTerms, maxResults);

    res.json(Helpers.formatResponse(true, videos, 'YouTube videos retrieved successfully'));

  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to search YouTube videos'));
  }
});

module.exports = router;