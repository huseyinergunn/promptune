const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalPrompt: { type: String, required: true },
  optimizedPrompt: { type: String, required: true },
  originalTokenCount: { type: Number, required: true },
  optimizedTokenCount: { type: Number, required: true },
  savedTokens: { type: Number, required: true },
  percentage: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('History', historySchema);
