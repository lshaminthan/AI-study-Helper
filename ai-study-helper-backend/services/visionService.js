const visionClient = require('../config/google-vision');
const fs = require('fs');

class VisionService {
  async extractTextFromImage(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);

      const [result] = await visionClient.textDetection({
        image: {
          content: imageBuffer.toString('base64')
        }
      });

      const detections = result.textAnnotations;

      if (detections && detections.length > 0) {
        return detections[0].description;
      }

      return '';
    } catch (error) {
      console.error('Vision API error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async detectImageProperties(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);

      const [result] = await visionClient.imageProperties({
        image: {
          content: imageBuffer.toString('base64')
        }
      });

      return result.imagePropertiesAnnotation;
    } catch (error) {
      console.error('Vision API properties error:', error);
      throw new Error('Failed to detect image properties');
    }
  }
}

module.exports = new VisionService();