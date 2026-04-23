const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PDFService {
  async generateStudyPDF(studySession) {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: studySession.title,
          Author: 'AI Study Helper',
          Subject: 'Study Notes',
          Creator: 'AI Study Helper App'
        }
      });

      const fileName = `study-notes-${uuidv4()}.pdf`;
      const filePath = path.join('uploads', fileName);

      // Pipe PDF to file
      doc.pipe(fs.createWriteStream(filePath));

      // Color palette
      const colors = {
        primary: '#1a1a1a',
        secondary: '#4a90e2',
        accent: '#7b68ee',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        light: '#f8f9fa',
        dark: '#343a40',
        purple: '#6f42c1',
        teal: '#20c997'
      };

      let yPosition = 50;

      // Header with gradient background
      this.addGradientHeader(doc, studySession.title, colors);
      yPosition = 120;

      // Session metadata card
      yPosition = this.addMetadataCard(doc, studySession, colors, yPosition);
      yPosition += 30;

      // Table of contents
      yPosition = this.addTableOfContents(doc, studySession, colors, yPosition);
      yPosition += 20;

      // Summary section
      if (studySession.analysis.summary) {
        yPosition = this.addSection(doc, 'Summary', studySession.analysis.summary, colors.secondary, colors, yPosition);
        yPosition += 20;
      }

      // Explanations section
      if (studySession.analysis.explanations) {
        yPosition = this.addSection(doc, 'Detailed Explanations', studySession.analysis.explanations, colors.accent, colors, yPosition);
        yPosition += 20;
      }

      // Quiz Questions section
      if (studySession.analysis.quizQuestions && studySession.analysis.quizQuestions.length > 0) {
        yPosition = this.addQuizSection(doc, studySession.analysis.quizQuestions, colors, yPosition);
        yPosition += 20;
      }

      // Flashcards section
      if (studySession.analysis.flashcards && studySession.analysis.flashcards.length > 0) {
        yPosition = this.addFlashcardsSection(doc, studySession.analysis.flashcards, colors, yPosition);
        yPosition += 20;
      }

      // Mind Map section
      if (studySession.analysis.mindMap) {
        yPosition = this.addMindMapSection(doc, studySession.analysis.mindMap, colors, yPosition);
        yPosition += 20;
      }

      // YouTube Videos section
      if (studySession.analysis.youtubeVideos && studySession.analysis.youtubeVideos.length > 0) {
        yPosition = this.addYouTubeSection(doc, studySession.analysis.youtubeVideos, colors, yPosition);
      }

      // Add footer to the last page
      this.addFooter(doc, colors);

      // Finalize PDF
      doc.end();

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          resolve({
            fileName,
            filePath,
            downloadUrl: `/uploads/${fileName}`
          });
        });

        doc.on('error', reject);
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  addGradientHeader(doc, title, colors) {
    // Background gradient effect
    doc.rect(0, 0, doc.page.width, 100).fill(colors.secondary);
    doc.rect(0, 80, doc.page.width, 20).fill(colors.accent);

    // Title
    doc.fillColor('white')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('📚 AI Study Helper', 50, 25, { align: 'left' });

    doc.fontSize(18)
       .font('Helvetica')
       .text(title, 50, 55, { width: 500, align: 'left' });
  }

  addMetadataCard(doc, studySession, colors, yPosition) {
    // Card background
    doc.roundedRect(40, yPosition, doc.page.width - 80, 60, 8)
       .fillAndStroke(colors.light, colors.secondary);

    // Content
    doc.fillColor(colors.dark)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('📋 Session Details', 55, yPosition + 15);

    doc.fontSize(10)
       .font('Helvetica')
       .text(`Type: ${studySession.imageType.charAt(0).toUpperCase() + studySession.imageType.slice(1)}`, 55, yPosition + 35)
       .text(`Created: ${new Date(studySession.createdAt).toLocaleDateString()}`, 200, yPosition + 35)
       .text(`Request: ${studySession.userPrompt.substring(0, 80)}...`, 55, yPosition + 50);

    return yPosition + 70;
  }

  addTableOfContents(doc, studySession, colors, yPosition) {
    const analysis = studySession.analysis;
    const sections = [];

    if (analysis.summary) sections.push('📝 Summary');
    if (analysis.explanations) sections.push('📖 Detailed Explanations');
    if (analysis.quizQuestions?.length > 0) sections.push(`❓ Quiz Questions (${analysis.quizQuestions.length})`);
    if (analysis.flashcards?.length > 0) sections.push(`🗂️ Flashcards (${analysis.flashcards.length})`);
    if (analysis.mindMap) sections.push('🧠 Mind Map');
    if (analysis.youtubeVideos?.length > 0) sections.push(`📺 Recommended Videos (${analysis.youtubeVideos.length})`);

    if (sections.length === 0) return yPosition;

    // Section header
    doc.fillColor(colors.primary)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('📑 Contents', 50, yPosition);

    yPosition += 25;

    // Contents list
    sections.forEach((section, index) => {
      doc.fillColor(colors.dark)
         .fontSize(11)
         .font('Helvetica')
         .text(section, 65, yPosition + (index * 15));
    });

    return yPosition + (sections.length * 15) + 10;
  }

  addSection(doc, title, content, color, colors, yPosition) {
    // Check if we need a new page
    if (yPosition > doc.page.height - 200) {
      this.addFooter(doc, colors);
      doc.addPage();
      yPosition = 50;
    }

    // Section header with colored background
    doc.roundedRect(40, yPosition, doc.page.width - 80, 25, 4)
       .fill(color);

    doc.fillColor('white')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(title, 50, yPosition + 7);

    yPosition += 35;

    // Content box
    const contentHeight = Math.min(this.calculateTextHeight(doc, content, 10, doc.page.width - 100), 300);

    doc.roundedRect(40, yPosition, doc.page.width - 80, contentHeight + 20, 4)
       .fillAndStroke('#fafafa', '#e0e0e0');

    doc.fillColor(colors.dark)
       .fontSize(10)
       .font('Helvetica')
       .text(content, 50, yPosition + 10, {
         width: doc.page.width - 100,
         align: 'justify'
       });

    return yPosition + contentHeight + 30;
  }

  addQuizSection(doc, questions, colors, yPosition) {
    // Check if we need a new page
    if (yPosition > doc.page.height - 300) {
      this.addFooter(doc, colors);
      doc.addPage();
      yPosition = 50;
    }

    // Section header
    doc.roundedRect(40, yPosition, doc.page.width - 80, 25, 4)
       .fill(colors.warning);

    doc.fillColor('white')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(`❓ Quiz Questions (${questions.length})`, 50, yPosition + 7);

    yPosition += 40;

    questions.forEach((quiz, index) => {
      if (yPosition > doc.page.height - 150) {
        this.addFooter(doc, colors);
        doc.addPage();
        yPosition = 50;
      }

      // Question card
      const questionHeight = 80 + (quiz.options ? quiz.options.length * 15 : 20);

      doc.roundedRect(45, yPosition, doc.page.width - 90, questionHeight, 6)
         .fillAndStroke('#f8f9fa', colors.warning);

      // Question number and text
      doc.fillColor(colors.warning)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(`Q${index + 1}`, 55, yPosition + 10);

      doc.fillColor(colors.dark)
         .fontSize(11)
         .font('Helvetica')
         .text(quiz.question, 80, yPosition + 10, { width: doc.page.width - 140 });

      let optionY = yPosition + 35;

      // Options for multiple choice
      if (quiz.options && quiz.options.length > 0) {
        quiz.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          const isCorrect = option === quiz.correctAnswer;

          doc.fillColor(isCorrect ? colors.success : colors.dark)
             .fontSize(10)
             .font(isCorrect ? 'Helvetica-Bold' : 'Helvetica')
             .text(`${letter}) ${option}`, 65, optionY);

          if (isCorrect) {
            doc.fillColor(colors.success)
               .fontSize(8)
               .text('✓ Correct', doc.page.width - 120, optionY);
          }

          optionY += 15;
        });
      } else {
        // Short answer
        doc.fillColor(colors.success)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('Answer: ', 65, optionY)
           .font('Helvetica')
           .text(quiz.correctAnswer, 110, optionY, { width: doc.page.width - 150 });
      }

      yPosition += questionHeight + 15;
    });

    return yPosition;
  }

  addFlashcardsSection(doc, flashcards, colors, yPosition) {
    if (yPosition > doc.page.height - 200) {
      this.addFooter(doc, colors);
      doc.addPage();
      yPosition = 50;
    }

    // Section header
    doc.roundedRect(40, yPosition, doc.page.width - 80, 25, 4)
       .fill(colors.purple);

    doc.fillColor('white')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(`🗂️ Flashcards (${flashcards.length})`, 50, yPosition + 7);

    yPosition += 40;

    flashcards.forEach((card, index) => {
      if (yPosition > doc.page.height - 100) {
        this.addFooter(doc, colors);
        doc.addPage();
        yPosition = 50;
      }

      // Flashcard design
      const cardWidth = (doc.page.width - 120) / 2;
      const cardHeight = 80;

      // Front card (Question)
      doc.roundedRect(45, yPosition, cardWidth, cardHeight, 8)
         .fillAndStroke(colors.purple, colors.dark);

      doc.fillColor('white')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('FRONT', 50, yPosition + 8);

      doc.fontSize(9)
         .font('Helvetica')
         .text(card.front, 50, yPosition + 25, { width: cardWidth - 10, height: cardHeight - 30 });

      // Back card (Answer)
      doc.roundedRect(65 + cardWidth, yPosition, cardWidth, cardHeight, 8)
         .fillAndStroke('#f8f9fa', colors.purple);

      doc.fillColor(colors.purple)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('BACK', 70 + cardWidth, yPosition + 8);

      doc.fillColor(colors.dark)
         .fontSize(9)
         .font('Helvetica')
         .text(card.back, 70 + cardWidth, yPosition + 25, { width: cardWidth - 10, height: cardHeight - 30 });

      yPosition += cardHeight + 20;
    });

    return yPosition;
  }

  addMindMapSection(doc, mindMap, colors, yPosition) {
    if (yPosition > doc.page.height - 200) {
      this.addFooter(doc, colors);
      doc.addPage();
      yPosition = 50;
    }

    // Section header
    doc.roundedRect(40, yPosition, doc.page.width - 80, 25, 4)
       .fill(colors.teal);

    doc.fillColor('white')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('🧠 Mind Map', 50, yPosition + 7);

    yPosition += 35;

    // Mind map content with background
    const mindMapHeight = Math.min(this.calculateTextHeight(doc, mindMap, 9, doc.page.width - 100), 400);

    doc.roundedRect(40, yPosition, doc.page.width - 80, mindMapHeight + 20, 4)
       .fillAndStroke('#f0fffe', colors.teal);

    doc.fillColor(colors.dark)
       .fontSize(9)
       .font('Courier')
       .text(mindMap, 50, yPosition + 10, {
         width: doc.page.width - 100,
         lineGap: 2
       });

    return yPosition + mindMapHeight + 30;
  }

  addYouTubeSection(doc, videos, colors, yPosition) {
    if (yPosition > doc.page.height - 200) {
      this.addFooter(doc, colors);
      doc.addPage();
      yPosition = 50;
    }

    // Section header
    doc.roundedRect(40, yPosition, doc.page.width - 80, 25, 4)
       .fill(colors.danger);

    doc.fillColor('white')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(`📺 Recommended Videos (${videos.length})`, 50, yPosition + 7);

    yPosition += 40;

    videos.slice(0, 6).forEach((video, index) => {
      if (yPosition > doc.page.height - 80) {
        this.addFooter(doc, colors);
        doc.addPage();
        yPosition = 50;
      }

      // Video card
      doc.roundedRect(45, yPosition, doc.page.width - 90, 60, 6)
         .fillAndStroke('#fff5f5', colors.danger);

      // Video info
      doc.fillColor(colors.danger)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${video.title}`, 55, yPosition + 10, { width: doc.page.width - 120 });

      doc.fillColor(colors.dark)
         .fontSize(9)
         .font('Helvetica')
         .text(`Channel: ${video.channelTitle || 'Unknown'}`, 55, yPosition + 28)
         .text(`Views: ${video.views || 'N/A'}`, 55, yPosition + 42);

      const videoUrl = video.url || `https://youtube.com/watch?v=${video.videoId}`;
      doc.fontSize(8)
         .text(videoUrl, 200, yPosition + 42, { width: doc.page.width - 260 });

      yPosition += 70;
    });

    return yPosition;
  }

  addFooter(doc, colors) {
    // Get the total number of pages that will be in the final document
    const currentPage = doc.page;
    const pageCount = doc.bufferedPageRange().count + doc.bufferedPageRange().start;

    // Add footer to current page only
    // Footer background
    doc.rect(0, doc.page.height - 40, doc.page.width, 40)
       .fill('#f8f9fa');

    // Footer content
    doc.fillColor(colors.dark)
       .fontSize(8)
       .text(
         `Generated by AI Study Helper • ${new Date().toLocaleDateString()}`,
         50,
         doc.page.height - 25,
         { align: 'center', width: doc.page.width - 100 }
       );
  }

  calculateTextHeight(doc, text, fontSize, width) {
    const currentSize = doc._fontSize;

    doc.fontSize(fontSize);
    const height = doc.heightOfString(text, { width });

    doc.fontSize(currentSize);
    return height;
  }
}

module.exports = new PDFService();