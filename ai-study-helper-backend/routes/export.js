const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const pdfService = require('../services/pdfService');
const StudySession = require('../models/StudySession');
const Helpers = require('../utils/helpers');

// Export study session as PDF
router.get('/pdf/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const studySession = await StudySession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });

    if (!studySession) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Study session not found'));
    }

    const pdfResult = await pdfService.generateStudyPDF(studySession);

    res.json(Helpers.formatResponse(true, pdfResult, 'PDF generated successfully'));

  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to generate PDF', error.message));
  }
});

// Download PDF file
router.get('/download/:fileName', isAuthenticated, (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = `uploads/${fileName}`;

    // Security check - ensure filename is valid and file exists
    if (!Helpers.isValidImageFile(fileName) && !fileName.endsWith('.pdf')) {
      return res.status(400).json(Helpers.formatResponse(false, null, 'Invalid file type'));
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(404).json(Helpers.formatResponse(false, null, 'File not found'));
        }
      }
    });

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to download file'));
  }
});

// Export multiple study sessions as combined PDF
router.post('/pdf/combined', isAuthenticated, async (req, res) => {
  try {
    const { sessionIds } = req.body;

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json(Helpers.formatResponse(false, null, 'Session IDs are required'));
    }

    const studySessions = await StudySession.find({
      _id: { $in: sessionIds },
      userId: req.user._id
    });

    if (studySessions.length === 0) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'No study sessions found'));
    }

    // Create a combined study session object for PDF generation
    const combinedSession = {
      title: `Combined Study Notes - ${studySessions.length} Sessions`,
      userPrompt: 'Combined study sessions export',
      analysis: {
        summary: studySessions.map(session => session.analysis.summary).join('\n\n'),
        explanations: studySessions.map(session => session.analysis.explanations).join('\n\n'),
        quizQuestions: studySessions.flatMap(session => session.analysis.quizQuestions || []),
        flashcards: studySessions.flatMap(session => session.analysis.flashcards || []),
        youtubeVideos: studySessions.flatMap(session => session.analysis.youtubeVideos || []),
        mindMap: studySessions.map(session => session.analysis.mindMap).join('\n\n')
      }
    };

    const pdfResult = await pdfService.generateStudyPDF(combinedSession);

    res.json(Helpers.formatResponse(true, pdfResult, 'Combined PDF generated successfully'));

  } catch (error) {
    console.error('Combined PDF export error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to generate combined PDF'));
  }
});

// Export study session data as JSON
router.get('/json/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const studySession = await StudySession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    }).populate('chatMessages');

    if (!studySession) {
      return res.status(404).json(Helpers.formatResponse(false, null, 'Study session not found'));
    }

    // Format data for export
    const exportData = {
      title: studySession.title,
      imageType: studySession.imageType,
      userPrompt: studySession.userPrompt,
      createdAt: studySession.createdAt,
      analysis: studySession.analysis,
      chatMessages: studySession.chatMessages.map(msg => ({
        message: msg.message,
        response: msg.response,
        timestamp: msg.createdAt
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="study-session-${studySession._id}.json"`);
    res.json(exportData);

  } catch (error) {
    console.error('JSON export error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to export JSON'));
  }
});

// Get export statistics for user
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const totalSessions = await StudySession.countDocuments({ userId: req.user._id });

    const sessionStats = await StudySession.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$imageType',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalSessions,
      sessionsByType: sessionStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      availableFormats: ['PDF', 'JSON']
    };

    res.json(Helpers.formatResponse(true, stats, 'Export statistics retrieved successfully'));

  } catch (error) {
    console.error('Export stats error:', error);
    res.status(500).json(Helpers.formatResponse(false, null, 'Failed to retrieve export statistics'));
  }
});

module.exports = router;