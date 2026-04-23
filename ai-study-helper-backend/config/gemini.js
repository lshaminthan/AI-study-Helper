const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const EMBEDDING_MODEL = 'models/gemini-embedding-001';
const EMBEDDING_API_URL = `https://generativelanguage.googleapis.com/v1beta/${EMBEDDING_MODEL}:batchEmbedContents`;
const EMBEDDING_DIMENSIONS = 768;
const EMBEDDING_BATCH_SIZE = 100;

class GeminiClient {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  async generateContent(prompt) {
    try {
      const response = await axios.post(GEMINI_API_URL, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey
        }
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw new Error('Failed to generate content with Gemini API');
    }
  }

  async analyzeImage(imageBase64, prompt) {
    try {
      const response = await axios.post(GEMINI_API_URL, {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey
        }
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini Vision API error:', error.response?.data || error.message);
      throw new Error('Failed to analyze image with Gemini API');
    }
  }

  // Convert texts into embedding vectors.
  // taskType is 'RETRIEVAL_DOCUMENT' for stored chunks and 'RETRIEVAL_QUERY' for user questions.
  async embedTexts(texts, taskType = 'RETRIEVAL_DOCUMENT') {
    const embeddings = [];

    try {
      for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
        const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);
        const response = await axios.post(EMBEDDING_API_URL, {
          requests: batch.map(text => ({
            model: EMBEDDING_MODEL,
            content: { parts: [{ text }] },
            taskType,
            outputDimensionality: EMBEDDING_DIMENSIONS
          }))
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.apiKey
          }
        });

        embeddings.push(...response.data.embeddings.map(embedding => embedding.values));
      }

      return embeddings;
    } catch (error) {
      console.error('Gemini Embedding API error:', error.response?.data || error.message);
      throw new Error('Failed to create embeddings with Gemini API');
    }
  }
}

module.exports = new GeminiClient();