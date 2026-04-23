const fs = require('fs');
const path = require('path');

class Helpers {
  // Classify image type based on content analysis
  static classifyImageType(ocrText, analysisContent) {
    const text = (ocrText + ' ' + analysisContent).toLowerCase();

    // Check for diagram indicators
    const diagramKeywords = ['diagram', 'figure', 'chart', 'graph', 'illustration', 'schema', 'flow', 'process'];
    const hasDiagramKeywords = diagramKeywords.some(keyword => text.includes(keyword));

    // Check for textbook indicators
    const textbookKeywords = ['chapter', 'section', 'page', 'definition', 'theorem', 'example', 'exercise'];
    const hasTextbookKeywords = textbookKeywords.some(keyword => text.includes(keyword));

    // Check text density and structure
    const wordCount = ocrText.split(/\s+/).length;
    const lineCount = ocrText.split(/\n/).length;
    const avgWordsPerLine = wordCount / lineCount;

    if (hasDiagramKeywords || avgWordsPerLine < 3) {
      return 'diagram';
    } else if (hasTextbookKeywords || avgWordsPerLine > 8) {
      return 'textbook';
    } else {
      return 'handwritten';
    }
  }

  // Clean and format text
  static cleanText(text) {
    if (!text) return '';

    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
  }

  // Generate study session title
  static generateSessionTitle(userPrompt, ocrText) {
    const prompt = userPrompt.toLowerCase();
    const content = ocrText.substring(0, 100).toLowerCase();

    // Extract key terms
    const keyTerms = [];

    // Look for subjects in prompt
    const subjects = ['math', 'physics', 'chemistry', 'biology', 'history', 'english', 'literature', 'science'];
    subjects.forEach(subject => {
      if (prompt.includes(subject) || content.includes(subject)) {
        keyTerms.push(subject);
      }
    });

    // Look for topics in content
    const words = content.split(' ').filter(word => word.length > 4);
    if (words.length > 0) {
      keyTerms.push(words[0]);
    }

    if (keyTerms.length > 0) {
      return `Study Session: ${keyTerms.join(', ')}`.substring(0, 50);
    } else {
      return `Study Session: ${new Date().toLocaleDateString()}`;
    }
  }

  // Validate file type
  static isValidImageFile(fileName) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
    const extension = path.extname(fileName).toLowerCase();
    return allowedExtensions.includes(extension);
  }

  // Create uploads directory if it doesn't exist
  static ensureUploadsDirectory() {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  // Format response for consistent API returns
  static formatResponse(success, data = null, message = '', errors = null) {
    return {
      success,
      data,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  // Extract key concepts from text
  static extractKeyConcepts(text, maxConcepts = 5) {
    if (!text) return [];

    // Simple concept extraction based on capitalized words and common patterns
    const words = text.split(/\s+/);
    const concepts = [];

    // Look for capitalized words (potential proper nouns/concepts)
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && /^[A-Z]/.test(cleanWord)) {
        if (!concepts.includes(cleanWord) && concepts.length < maxConcepts) {
          concepts.push(cleanWord);
        }
      }
    });

    return concepts;
  }
}

module.exports = Helpers;