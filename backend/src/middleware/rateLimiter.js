const rateLimit = require('express-rate-limit');

const optimizeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Optimizasyon limitine ulaştınız. 1 dakika bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const summarizeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Özetleme limitine ulaştınız. 1 dakika bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { optimizeLimiter, summarizeLimiter };
