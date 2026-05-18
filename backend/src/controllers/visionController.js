const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const OPTIMIZE_PROMPT = `Sen bir prompt optimizasyon uzmanısın. Verilen promptu daha az token kullanacak şekilde optimize et.

Kurallar:
- Orijinal promptun amacı ve anlamı tam korunmalı
- Gereksiz nezaket ifadeleri çıkar: "lütfen", "rica etsem", "bana", "verir misin" gibi
- Tekrar eden bilgileri çıkar
- Kısaltmalar kullan ama anlaşılırlığı bozma
- Minimum %20 token tasarrufu hedefle
- Maksimum %70 token tasarrufu geç — çok agresif olma
- Prompt bir soru ise soru formatını koru
- Prompt bir komut ise komut formatını koru
- Sadece optimize edilmiş promptu döndür, hiçbir açıklama yapma`;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya türü. JPEG, PNG, WEBP veya GIF yükleyin.'));
    }
  },
});

const analyzeImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Görsel gerekli' });
  }

  try {
    const base64Image = req.file.buffer.toString('base64');
    const inlineData = { data: base64Image, mimeType: req.file.mimetype };

    const validationResult = await model.generateContent([
      { inlineData },
      'Bu görseli analiz et. Şu sorulara SADECE "evet" veya "hayır" ile cevap ver:\n1. Görselde okunabilir metin var mı?\n2. Bu bir market fişi, belge, ekran görüntüsü, not veya yazılı içerik mi?\nCevap formatı: "metin:evet/hayır, uygun:evet/hayır"',
    ]);

    const validationText = validationResult.response.text().toLowerCase();

    if (validationText.includes('metin:hayır') || validationText.includes('uygun:hayır')) {
      return res.status(400).json({
        error: 'Bu görsel analiz için uygun değil. Lütfen metin içeren bir ekran görüntüsü, fiş, belge veya not yükleyin.',
      });
    }

    const extractResult = await model.generateContent([
      { inlineData },
      'Bu görseldeki tüm metni oku ve aynen yaz. Sadece metni yaz, başka açıklama yapma. Metin yoksa \'Görselde metin bulunamadı\' yaz.',
    ]);

    const extractedText = extractResult.response.text().trim();

    const { totalTokens: originalTokenCount } = await model.countTokens(extractedText);

    const optimizeResult = await model.generateContent(`${OPTIMIZE_PROMPT}\n\n${extractedText}`);
    const optimizedPrompt = optimizeResult.response.text().trim();

    const { totalTokens: optimizedTokenCount } = await model.countTokens(optimizedPrompt);

    const savedTokens = originalTokenCount - optimizedTokenCount;
    const percentage = parseFloat(((savedTokens / originalTokenCount) * 100).toFixed(2));

    res.json({
      extractedText,
      originalTokenCount,
      optimized: {
        prompt: optimizedPrompt,
        tokenCount: optimizedTokenCount,
      },
      savings: {
        tokens: savedTokens,
        percentage,
      },
    });
  } catch (err) {
    console.error('Vision error:', err.message);
    res.status(500).json({ error: 'Görsel analiz başarısız', details: err.message });
  }
};

module.exports = { upload, analyzeImage };
