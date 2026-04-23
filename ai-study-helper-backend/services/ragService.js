const geminiClient = require('../config/gemini');
const Chunk = require('../models/Chunk');
const StudySession = require('../models/StudySession');
const { chunkText } = require('../utils/chunker');

const TOP_K = 5;
const MIN_SIMILARITY = 0.3;

// Retrieval-Augmented Generation:
//   1. Index   - split each study session into chunks and store their embeddings
//   2. Retrieve - embed the user's question and find the most similar chunks
//   3. Generate - send only those chunks to Gemini as context for the answer
class RagService {
  // Chunk + embed a study session's content and store it in MongoDB
  async indexSession(studySession) {
    const sections = [
      { source: 'notes', text: studySession.ocrText },
      { source: 'summary', text: studySession.analysis?.summary },
      { source: 'explanations', text: studySession.analysis?.explanations }
    ];

    const pieces = [];
    sections.forEach(({ source, text }) => {
      chunkText(text).forEach((chunk, chunkIndex) => {
        pieces.push({ source, chunkIndex, text: chunk });
      });
    });

    // Embed before deleting old chunks so a failed API call leaves the existing index intact
    const embeddings = pieces.length > 0
      ? await geminiClient.embedTexts(pieces.map(piece => piece.text), 'RETRIEVAL_DOCUMENT')
      : [];

    // Replace any old chunks so re-indexing (e.g. after regenerate) doesn't duplicate content
    await Chunk.deleteMany({ studySessionId: studySession._id });

    if (pieces.length > 0) {
      await Chunk.insertMany(pieces.map((piece, i) => ({
        userId: studySession.userId,
        studySessionId: studySession._id,
        source: piece.source,
        chunkIndex: piece.chunkIndex,
        text: piece.text,
        embedding: embeddings[i]
      })));
    }

    studySession.ragIndexedAt = new Date();
    await studySession.save();

    return pieces.length;
  }

  // Index without failing the caller - uploads should still succeed if embedding fails
  async safeIndexSession(studySession) {
    try {
      return await this.indexSession(studySession);
    } catch (error) {
      console.warn(`RAG indexing failed for session ${studySession._id}:`, error.message);
      return 0;
    }
  }

  // Index any of the user's sessions that were created before RAG was added
  async ensureIndexed(userId, sessionId = null) {
    const filter = { userId, ragIndexedAt: { $exists: false } };
    if (sessionId) filter._id = sessionId;

    const unindexed = await StudySession.find(filter);
    for (const session of unindexed) {
      await this.indexSession(session);
    }
  }

  async deleteSessionChunks(studySessionId) {
    await Chunk.deleteMany({ studySessionId });
  }

  cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Find the chunks most relevant to the question.
  // scope 'session' searches one study session; 'all' searches every session the user has uploaded.
  async retrieve(userId, question, { sessionId, scope = 'session', topK = TOP_K } = {}) {
    await this.ensureIndexed(userId, scope === 'session' ? sessionId : null);

    const filter = { userId };
    if (scope === 'session') filter.studySessionId = sessionId;

    const chunks = await Chunk.find(filter).lean();
    if (chunks.length === 0) return [];

    const [queryEmbedding] = await geminiClient.embedTexts([question], 'RETRIEVAL_QUERY');

    const ranked = chunks
      .map(chunk => ({ ...chunk, score: this.cosineSimilarity(queryEmbedding, chunk.embedding) }))
      .filter(chunk => chunk.score >= MIN_SIMILARITY)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    // Attach session titles so the answer can cite where each chunk came from
    const sessionIds = [...new Set(ranked.map(chunk => chunk.studySessionId.toString()))];
    const sessions = await StudySession.find({ _id: { $in: sessionIds } }).select('title').lean();
    const titles = new Map(sessions.map(session => [session._id.toString(), session.title]));

    return ranked.map(chunk => ({
      studySessionId: chunk.studySessionId,
      sessionTitle: titles.get(chunk.studySessionId.toString()) || 'Study Session',
      source: chunk.source,
      text: chunk.text,
      score: Number(chunk.score.toFixed(3))
    }));
  }

  // Full RAG pipeline: retrieve relevant chunks, then generate a grounded answer
  async answer(userId, question, options = {}) {
    const sources = await this.retrieve(userId, question, options);

    if (sources.length === 0) {
      return {
        response: "I couldn't find anything related to that in your uploaded notes. Try rephrasing your question, or upload material that covers this topic.",
        sources: []
      };
    }

    const context = sources
      .map((source, i) => `[${i + 1}] (from "${source.sessionTitle}", ${source.source})\n${source.text}`)
      .join('\n\n');

    const prompt = `
      You are an AI study assistant. Answer the student's question using ONLY the retrieved context below.
      Cite the passages you used with their numbers, e.g. [1] or [2][3].
      If the context does not contain the answer, say that the information is not available in the uploaded material.
      If the student asks for a mind map, provide a detailed mind map structure in text format with proper indentation and hierarchy.

      Retrieved context:
      ${context}

      Question: ${question}
    `;

    const response = await geminiClient.generateContent(prompt);

    return { response, sources };
  }
}

module.exports = new RagService();
