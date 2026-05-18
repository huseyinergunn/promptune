const { Router } = require('express');
const { analyzePrompt, compareOptimize } = require('../controllers/optimizeController');
const { summarizeChat } = require('../controllers/summaryController');
const { getModels, compareModels } = require('../controllers/modelController');
const { upload, analyzeImage } = require('../controllers/visionController');
const { getHistory, deleteHistory, getStats } = require('../controllers/historyController');
const { register, login, me } = require('../controllers/authController');
const { optimizeLimiter, summarizeLimiter } = require('../middleware/rateLimiter');
const { protect, allowGuest } = require('../middleware/auth');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Promptune çalışıyor',
    timestamp: new Date(),
  });
});

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, me);

router.post('/optimize', allowGuest, optimizeLimiter, analyzePrompt);
router.post('/optimize/compare', allowGuest, compareOptimize);
router.post('/summarize', allowGuest, summarizeLimiter, summarizeChat);
router.get('/models', getModels);
router.post('/models/compare', allowGuest, compareModels);
router.post('/vision', protect, upload.single('image'), analyzeImage);
router.get('/history', protect, getHistory);
router.delete('/history', protect, deleteHistory);
router.get('/stats', getStats);

module.exports = router;
