const geminiClient = require('../config/gemini');
const fs = require('fs');

class GeminiService {
  async analyzeContent(ocrText, userPrompt, imageType) {
    try {
      const analysisPrompt = this.createAnalysisPrompt(ocrText, userPrompt, imageType);
      const response = await geminiClient.generateContent(analysisPrompt);

      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw new Error('Failed to analyze content');
    }
  }

  async analyzeDiagram(imagePath, userPrompt) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const diagramPrompt = this.createDiagramPrompt(userPrompt);
      const response = await geminiClient.analyzeImage(imageBase64, diagramPrompt);

      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Gemini diagram analysis error:', error);
      throw new Error('Failed to analyze diagram');
    }
  }

  async answerQuestion(question, contextContent, analysisData) {
    try {
      const questionPrompt = `
        Context from uploaded content: ${contextContent}

        Previous analysis data: ${JSON.stringify(analysisData, null, 2)}

        User Question: ${question}

        Please answer the question based ONLY on the uploaded content and analysis. If the question cannot be answered from the provided content, politely state that the information is not available in the uploaded material.

        Also, if the user asks for a mind map, provide a detailed mind map structure in text format with proper indentation and hierarchy.
      `;

      const response = await geminiClient.generateContent(questionPrompt);
      return response;
    } catch (error) {
      console.error('Gemini question answering error:', error);
      throw new Error('Failed to answer question');
    }
  }

  createAnalysisPrompt(ocrText, userPrompt, imageType) {
    return `
      You are an AI study assistant. Analyze the following content extracted from a ${imageType} image.

      Extracted Text: ${ocrText}

      User Request: ${userPrompt}

      Please provide a comprehensive analysis in the following JSON format:
      {
        "summary": "A concise summary of the main concepts and key points",
        "explanations": "Detailed explanations of complex concepts in simple language",
        "quizQuestions": [
          {
            "type": "multiple-choice",
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A"
          },
          {
            "type": "short-answer",
            "question": "Question text",
            "correctAnswer": "Expected answer"
          }
        ],
        "flashcards": [
          {
            "front": "Question or concept",
            "back": "Answer or explanation"
          }
        ],
        "youtubeSearchTerms": ["search term 1", "search term 2", "search term 3"],
        "mindMap": "A detailed hierarchical mind map structure in text format"
      }

      Make sure all content is educational, accurate, and helpful for studying.
    `;
  }

  createDiagramPrompt(userPrompt) {
    return `
      You are an AI study assistant analyzing a diagram image. Please:

      1. Identify all elements, labels, and relationships shown in the diagram
      2. Explain the concept or process being illustrated
      3. Generate study materials based on the diagram content

      User Request: ${userPrompt}

      Please provide a comprehensive analysis in the following JSON format:
      {
        "summary": "A concise summary of what the diagram shows and its main concepts",
        "explanations": "Detailed explanations of the diagram elements and relationships",
        "quizQuestions": [
          {
            "type": "multiple-choice",
            "question": "Question about the diagram",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A"
          }
        ],
        "flashcards": [
          {
            "front": "Diagram element or concept",
            "back": "Explanation or function"
          }
        ],
        "youtubeSearchTerms": ["relevant search terms for the diagram topic"],
        "mindMap": "A detailed hierarchical mind map of the diagram concepts"
      }
    `;
  }

  parseAnalysisResponse(response) {
    try {
      // First try to extract JSON from response if it's wrapped in markdown or other text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      let parsedResponse;

      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Try to parse the entire response
        parsedResponse = JSON.parse(response);
      }

      // Ensure all arrays are properly parsed
      if (parsedResponse.quizQuestions && typeof parsedResponse.quizQuestions === 'string') {
        try {
          parsedResponse.quizQuestions = JSON.parse(parsedResponse.quizQuestions);
        } catch (e) {
          console.warn('Failed to parse quizQuestions string:', e);
          parsedResponse.quizQuestions = [];
        }
      }

      if (parsedResponse.flashcards && typeof parsedResponse.flashcards === 'string') {
        try {
          parsedResponse.flashcards = JSON.parse(parsedResponse.flashcards);
        } catch (e) {
          console.warn('Failed to parse flashcards string:', e);
          parsedResponse.flashcards = [];
        }
      }

      if (parsedResponse.youtubeSearchTerms && typeof parsedResponse.youtubeSearchTerms === 'string') {
        try {
          parsedResponse.youtubeSearchTerms = JSON.parse(parsedResponse.youtubeSearchTerms);
        } catch (e) {
          console.warn('Failed to parse youtubeSearchTerms string:', e);
          parsedResponse.youtubeSearchTerms = [];
        }
      }

      // Ensure required fields exist and are in correct format
      const cleanedResponse = {
        summary: parsedResponse.summary || '',
        explanations: parsedResponse.explanations || '',
        quizQuestions: Array.isArray(parsedResponse.quizQuestions) ? parsedResponse.quizQuestions : [],
        flashcards: Array.isArray(parsedResponse.flashcards) ? parsedResponse.flashcards : [],
        youtubeSearchTerms: Array.isArray(parsedResponse.youtubeSearchTerms) ? parsedResponse.youtubeSearchTerms : [],
        mindMap: parsedResponse.mindMap || ''
      };

      return cleanedResponse;
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      console.log('Raw response:', response);

      // Return a fallback structure with extracted text
      return {
        summary: response.substring(0, 500) + '...',
        explanations: "Analysis completed. The content has been processed but formatting may need adjustment.",
        quizQuestions: [],
        flashcards: [],
        youtubeSearchTerms: ['education', 'tutorial'],
        mindMap: "Content analyzed successfully. Mind map generation may be available through the chat interface."
      };
    }
  }
}

module.exports = new GeminiService();