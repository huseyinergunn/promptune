const models = require('../data/models');

const getModels = (req, res) => {
  res.json(models);
};

const compareModels = (req, res) => {
  const { tokenCount, taskType = 'genel' } = req.body;

  if (!tokenCount) {
    return res.status(400).json({ error: 'Token sayısı gerekli' });
  }

  const scored = models.map((model) => {
    const inputCost = (tokenCount / 1000) * model.inputCostPer1k;
    const outputCost = (tokenCount / 1000) * model.outputCostPer1k;
    const totalCost = inputCost + outputCost;

    let score = 0;
    if (model.bestFor.includes(taskType)) score = 2;
    else if (model.bestFor.includes('genel')) score = 1;

    return { ...model, inputCost, outputCost, totalCost, totalCostFormatted: `$${totalCost.toFixed(6)}`, score };
  });

  scored.sort((a, b) => b.score - a.score || a.totalCost - b.totalCost);

  const result = scored.map((model, i) => ({ ...model, recommended: i === 0 }));

  res.json({ tokenCount, taskType, models: result });
};

module.exports = { getModels, compareModels };
