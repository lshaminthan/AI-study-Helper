// Split text into overlapping chunks for RAG indexing.
// Chunks break on sentence boundaries where possible so each one stays readable.
function chunkText(text, chunkSize = 500, overlap = 100) {
  if (!text || !text.trim()) return [];

  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= chunkSize) return [cleaned];

  const sentences = cleaned.match(/[^.!?]+[.!?]*\s*/g) || [cleaned];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    // Very long sentences (common in OCR output) are hard-split
    if (sentence.length > chunkSize) {
      if (current.trim()) chunks.push(current.trim());
      for (let i = 0; i < sentence.length; i += chunkSize - overlap) {
        chunks.push(sentence.slice(i, i + chunkSize).trim());
      }
      current = '';
      continue;
    }

    if ((current + sentence).length > chunkSize && current.trim()) {
      chunks.push(current.trim());
      // Carry the end of the previous chunk forward so context isn't lost at the boundary
      current = current.slice(-overlap);
    }
    current += sentence;
  }

  if (current.trim()) chunks.push(current.trim());

  return chunks.filter(chunk => chunk.length > 0);
}

module.exports = { chunkText };
