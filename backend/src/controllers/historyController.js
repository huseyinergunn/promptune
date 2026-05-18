const History = require('../models/History');

const getHistory = async (req, res) => {
  try {
    const history = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('_id originalPrompt optimizedPrompt originalTokenCount optimizedTokenCount savedTokens percentage createdAt');

    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Geçmiş alınamadı', details: err.message });
  }
};

const deleteHistory = async (req, res) => {
  try {
    await History.deleteMany({ userId: req.user._id });
    res.json({ message: 'Geçmiş temizlendi' });
  } catch (err) {
    res.status(500).json({ error: 'Geçmiş silinemedi', details: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const totalOptimizations = await History.countDocuments();
    const allHistory = await History.find({}, 'savedTokens percentage');

    const positiveHistory = allHistory.filter(h => h.savedTokens > 0 && h.percentage > 0);

    const totalSavedTokens = positiveHistory.reduce((sum, h) => sum + h.savedTokens, 0);
    const avgPercentage = positiveHistory.length > 0
      ? Math.round(positiveHistory.reduce((sum, h) => sum + h.percentage, 0) / positiveHistory.length)
      : 0;

    res.json({ totalOptimizations, totalSavedTokens, avgPercentage });
  } catch (err) {
    res.status(500).json({ error: 'İstatistik alınamadı' });
  }
};

module.exports = { getHistory, deleteHistory, getStats };
