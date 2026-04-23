const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const ragService = require('../services/ragService');
const StudySession = require('../models/StudySession');
const ChatMessage = require('../models/ChatMessage');
const Helpers = require('../utils/helpers');

// Send message to chatbot
router.post('/message/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const { message } = req.body;
    const scope = req.body.scope === 'all' ? 'all' : 'session';

    if (!message || message.trim().length === 0) {
      return res.status(400).json(Helpers.formatResponse(false, null, 'Message is required'));
    }

    const studySession = await StudySession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });

    if (!studySession) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Study session not found'));
    }

    // Generate response with RAG: retrieve the most relevant chunks, then answer from them
    const { response, sources } = await ragService.answer(req.user._id, message, {
      sessionId: studySession._id,
      scope
    });

    // Check if user asked for mind map
    const isMindMapRequest = message.toLowerCase().includes('mind map') ||
                           message.toLowerCase().includes('mindmap') ||
                           message.toLowerCase().includes('concept map');

    let mindMapData = null;
    if (isMindMapRequest) {
      const mindMapPrompt = `
        Create a mind map for the query: "${message}"

        Based on the content: ${studySession.ocrText}

        Return a structured text mind map with proper indentation showing relationships and hierarchy.
      `;

      mindMapData = await geminiService.answerQuestion(mindMapPrompt, studySession.ocrText, studySession.analysis);
    }

    // Save chat message
    const chatMessage = new ChatMessage({
      studySessionId: studySession._id,
      userId: req.user._id,
      message: message.trim(),
      response: response,
      mindMap: mindMapData,
      scope,
      sources
    });

    await chatMessage.save();

    // Add to study session
    studySession.chatMessages.push(chatMessage._id);
    await studySession.save();

    res.json(Helpers.formatResponse(true, {
      id: chatMessage._id,
      message: chatMessage.message,
      response: chatMessage.response,
      mindMap: chatMessage.mindMap,
      scope: chatMessage.scope,
      sources: chatMessage.sources,
      timestamp: chatMessage.createdAt
    }, 'Message sent successfully'));

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to process message', error.message));
  }
});

// Get chat history for a study session
router.get('/history/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const studySession = await StudySession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });

    if (!studySession) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Study session not found'));
    }

    const chatMessages = await ChatMessage.find({
      studySessionId: req.params.sessionId
    }).sort({ createdAt: 1 });

    const formattedMessages = chatMessages.map(msg => ({
      id: msg._id,
      message: msg.message,
      response: msg.response,
      mindMap: msg.mindMap,
      scope: msg.scope,
      sources: msg.sources,
      timestamp: msg.createdAt
    }));

    res.json(Helpers.formatResponse(true, formattedMessages, 'Chat history retrieved successfully'));

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to retrieve chat history'));
  }
});

// Delete specific chat message
router.delete('/message/:messageId', isAuthenticated, async (req, res) => {
  try {
    const chatMessage = await ChatMessage.findOne({
      _id: req.params.messageId,
      userId: req.user._id
    });

    if (!chatMessage) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Chat message not found'));
    }

    // Remove from study session
    await StudySession.findByIdAndUpdate(chatMessage.studySessionId, {
      $pull: { chatMessages: req.params.messageId }
    });

    await ChatMessage.findByIdAndDelete(req.params.messageId);

    res.json(Helpers.formatResponse(true, null, 'Chat message deleted successfully'));

  } catch (error) {
    console.error('Delete chat message error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to delete chat message'));
  }
});

// Generate mind map for specific content
router.post('/mindmap', isAuthenticated, async (req, res) => {
  try {
    const { content, topic } = req.body;

    if (!content && !topic) {
      return res.status(400).json(Helpers.formatResponse(false, null, 'Content or topic is required'));
    }

    const mindMapPrompt = `
      Create a comprehensive mind map for: ${topic || 'the provided content'}

      Content: ${content || ''}

      Structure it as a hierarchical text with proper indentation showing:
      1. Main concept at the center
      2. Primary branches for major topics
      3. Secondary branches for subtopics
      4. Key details and relationships

      Use indentation and formatting to show the hierarchy clearly.
    `;

    const mindMap = await geminiService.answerQuestion(mindMapPrompt, content || '', {});

    res.json(Helpers.formatResponse(true, { mindMap }, 'Mind map generated successfully'));

  } catch (error) {
    console.error('Generate mind map error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to generate mind map'));
  }
});

// Clear chat history for a session
router.delete('/history/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const studySession = await StudySession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });

    if (!studySession) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Study session not found'));
    }

    // Delete all chat messages for this session
    await ChatMessage.deleteMany({
      studySessionId: req.params.sessionId,
      userId: req.user._id
    });

    // Clear chat messages from study session
    studySession.chatMessages = [];
    await studySession.save();

    res.json(Helpers.formatResponse(true, null, 'Chat history cleared successfully'));

  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to clear chat history'));
  }
});

module.exports = router;