const mongoose = require('mongoose');

const cacheSchema = new mongoose.Schema({
  promptHash: { type: String, required: true, unique: true },
  originalPrompt: { type: String, required: true },
  originalTokenCount: { type: Number, required: true },
  optimizedPrompt: { type: String, required: true },
  optimizedTokenCount: { type: Number, required: true },
  savedTokens: { type: Number, required: true },
  percentage: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
});

module.exports = mongoose.model('Cache', cacheSchema);
