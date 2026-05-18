# Promptune — Teknik Rapor

---

## 1. Proje Özeti

**Promptune**, yapay zeka kullanıcılarının promptlarını optimize ederek token maliyetlerini düşürmeyi amaçlayan bir web uygulamasıdır.

### Problem

GPT-4o, Claude, Gemini gibi modellerin API kullanımı token bazlı ücretlendirilir. Kullanıcılar genellikle fazla uzun, tekrarlı veya gereksiz nezaket içeren promptlar yazar. "Lütfen bana şunu açıklar mısınız, rica etsem..." gibi ifadeler anlam katmaz ama token harcar. Bu promptları sıkıştırmak, özellikle yoğun API kullanan geliştiriciler için doğrudan maliyet tasarrufu demektir.

### Ne Yapıyor?

- **Prompt Optimizasyon:** Groq Llama 3.3 70B ile gereksiz kelimeleri kaldırır, anlamı korur
- **3 Yaklaşım Karşılaştırma:** Agresif / Dengeli / Minimal optimizasyon seçenekleri
- **Chat Özetleme:** Uzun konuşmaları kısa özete dönüştürür
- **Görsel Analiz:** Görsel içindeki metni Gemini Vision ile okur, ardından optimize eder
- **Token Hesaplayıcı:** Farklı modeller için maliyet hesaplar ve karşılaştırır
- **Model Karşılaştırma:** Görev tipine göre model önerisi sunar
- **Geçmiş & İstatistikler:** Tüm optimizasyonları kaydeder, tasarruf istatistiği gösterir

### Hedef Kitle

- AI API'lerini düzenli kullanan yazılım geliştiriciler
- Prompt maliyetlerini takip eden startup ekipleri
- AI araçlarını öğrenen öğrenciler ve araştırmacılar

---

## 2. Mimari Kararlar

### Neden MERN Stack?

**MongoDB:** Optimizasyon geçmişi, cache kayıtları ve kullanıcı verileri serbest yapılı JSON. İleride yeni alan eklemek şema migrasyonu gerektirmiyor. TTL index ile cache otomasyonu için MongoDB'nin built-in desteği kritikti.

**Express + Node.js:** Groq ve Gemini SDK'ları Node için birinci sınıf destek sunuyor. Python/FastAPI alternatifi değerlendirdim; ancak frontend ile aynı dilde (JavaScript) kalmak geliştirme hızını artırıyor ve context switching'i azaltıyor.

**React:** Component bazlı yapı, 7 farklı sekme için ideal. Her sekme izole state taşıyor, birbirini etkileyen bağımlılık yok. Vite ile geliştirme sunucusu çok hızlı.

**Alternatifler:** Next.js düşündüm; SSR bu projede gerekli değildi, API rotaları zaten ayrı backend'de. Django + React kombinasyonu da akla geldi ama Python'da Groq/Gemini SDK'ları daha az olgun, iki ayrı dil gerektiriyor.

### Neden Monorepo?

`/backend` ve `/frontend` tek repoda, root `package.json`'da `concurrently` ile aynı anda çalışıyor:

```
npm run dev → concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

**Avantajları:**
- Tek `git clone`, tek `npm install` ile çalışır
- Frontend-backend değişikliklerini tek commit'te takip etmek mümkün
- Ortak `.env` referansı
- CI/CD kurulumu tek pipeline

### Neden Groq + Gemini?

**Groq:**
- Llama 3.3 70B'yi ücretsiz kota ile çalıştırıyor
- Çıkarım hızı rakiplerine kıyasla 5-10x daha hızlı (LPU mimarisi)
- Dakikada 5 istek ücretsiz kota — küçük projeye yeterli
- Prompt sıkıştırma ve özetleme için yeterince güçlü

**Gemini:**
- `countTokens` API'si gerçek token sayımı sunuyor — başka ücretsiz alternatif yok
- Vision API (Gemini 2.5 Flash) görsel içindeki metin okuma için en iyi ücretsiz seçenek
- Google'ın ücretsiz katmanı görsel analiz için yeterli

**Neden ikisini birleştirdik:** Groq Vision API sunmuyor. Gemini Vision sunuyor ama metin optimizasyonunda Groq kadar hızlı değil. İki servisin güçlü taraflarını birleştirmek en verimli sonucu verdi.

**Neden OpenAI değil:** GPT-4o'nun ücretsiz API kotası yok. Geliştirme ve test maliyeti sıfır tutmak için Groq + Gemini kombinasyonu en mantıklı seçimdi. Üretim ortamına geçildiğinde OpenAI kolayca eklenebilir.

---

## 3. Backend Teknik Detaylar

### API Tasarımı (REST)

Tüm route'lar `/api` prefix'i altında. Gerçek `routes/index.js` dosyası:

```javascript
// backend/src/routes/index.js
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

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
```

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/health` | — | Sunucu sağlık kontrolü |
| POST | `/auth/register` | — | Kullanıcı kaydı |
| POST | `/auth/login` | — | Giriş, JWT döner |
| GET | `/auth/me` | `protect` | Giriş yapan kullanıcı bilgisi |
| POST | `/optimize` | `allowGuest` + rate limit | Prompt optimizasyonu |
| POST | `/optimize/compare` | `allowGuest` | 3 yaklaşım karşılaştırması |
| POST | `/summarize` | `allowGuest` + rate limit | Chat özetleme |
| GET | `/models` | — | Model listesi |
| POST | `/models/compare` | `allowGuest` | Model karşılaştırma önerisi |
| POST | `/vision` | `protect` | Görsel analiz |
| GET | `/history` | `protect` | Kullanıcı geçmişi |
| DELETE | `/history` | `protect` | Tüm geçmişi sil |
| GET | `/stats` | — | Platform istatistikleri |

**Neden REST, GraphQL değil:** 13 endpoint için GraphQL'in şema, resolver ve tip tanımı yükü gereksiz. REST bu ölçekte daha az boilerplate ve daha hızlı geliştirme süreci sunuyor.

### JWT Authentication

Token üretimi `authController.js`'de:

```javascript
// backend/src/controllers/authController.js
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const login = async (req, res) => {
  const user = await User.findOne({ email });
  const match = await user.comparePassword(password);
  if (!match) return res.status(401).json({ error: 'Email veya şifre hatalı' });

  const token = signToken(user._id);
  res.json({ token, user: { id: user._id, email: user.email } });
};
```

`protect` middleware her korumalı route'ta token doğrular:

```javascript
// backend/src/middleware/auth.js
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Giriş yapmanız gerekiyor' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz token' });
  }
};
```

`allowGuest` middleware misafir kullanıcıları da kabul eder — token yoksa `req.isGuest = true` set eder:

```javascript
// backend/src/middleware/auth.js
const allowGuest = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    req.isGuest = true;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    req.isGuest = false;
    next();
  } catch {
    req.user = null;
    req.isGuest = true;
    next();
  }
};
```

**bcrypt ile şifre hashleme:** `User.js`'deki `pre('save')` hook'u şifreyi kayıt sırasında otomatik hash'ler:

```javascript
// backend/src/models/User.js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};
```

**Neden sessionStorage, localStorage değil:** `localStorage` XSS saldırısında kalıcı olarak ele geçirilebilir. `sessionStorage` sekme kapanınca silinir; bu projedeki kullanım senaryosu için yeterli güvenlik seviyesi.

Frontend'deki token kullanımı:

```javascript
// frontend/src/services/api.js
const authHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
```

### Cache Sistemi

Aynı prompt'un Groq'a iki kez gönderilmesini engeller. `optimizeController.js`'den ilgili bölüm:

```javascript
// backend/src/controllers/optimizeController.js
const analyzePrompt = async (req, res) => {
  const { prompt } = req.body;

  // 1. Normalize + hash
  const promptHash = crypto
    .createHash('sha256')
    .update(prompt.trim().toLowerCase())
    .digest('hex');

  // 2. Cache'de ara
  const cached = await Cache.findOne({ promptHash });
  if (cached) {
    return res.json({
      cached: true,
      original: { prompt: cached.originalPrompt, tokenCount: cached.originalTokenCount },
      optimized: { prompt: cached.optimizedPrompt, tokenCount: cached.optimizedTokenCount },
      savings: { tokens: cached.savedTokens, percentage: cached.percentage },
    });
  }

  // 3. Cache miss → Groq'a git
  // ... optimizasyon yapılır ...

  // 4. Sonucu kaydet
  await Cache.create({ promptHash, originalPrompt: prompt, ... });
};
```

Cache schema'sında TTL index:

```javascript
// backend/src/models/Cache.js
const cacheSchema = new mongoose.Schema({
  promptHash: { type: String, required: true, unique: true },
  originalPrompt: { type: String, required: true },
  originalTokenCount: { type: Number, required: true },
  optimizedPrompt: { type: String, required: true },
  optimizedTokenCount: { type: Number, required: true },
  savedTokens: { type: Number, required: true },
  percentage: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }, // 7 gün TTL
});
```

**Neden önemli:**
- Groq'un dakikada 5 istek kotasını korur
- Aynı popüler prompt'lar için yanıt süresi ~50ms'ye düşer
- TTL index (7 gün) ile MongoDB otomatik temizler — manuel cron gerekmez

**Normalizasyon:** `trim().toLowerCase()` ile "Merhaba " ve "merhaba" aynı hash'e düşer. Küçük yazım farkları cache miss'e yol açmaz.

### Rate Limiting

```javascript
// backend/src/middleware/rateLimiter.js
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
```

İki Groq endpoint'ine de uygulanır:

```javascript
router.post('/optimize', allowGuest, optimizeLimiter, analyzePrompt);
router.post('/summarize', allowGuest, summarizeLimiter, summarizeChat);
```

**Neden gerekli:**
- Groq'un API kotasını aşmamak için
- Otomatik bot'ların sistemi doldurmasını önlemek
- Misafir kullanıcılar da rate limit kapsamında
- `/summarize` de Groq çağrısı yaptığından ayrı limiter eklendi

### Prompt Validasyonu

Kullanıcı rastgele metin ya da "asdfgh" gibi anlamsız içerik gönderebilir. İki katmanlı validasyon:

```javascript
// backend/src/controllers/optimizeController.js

// 1. Karakter limiti — O(1), API çağrısı yapmadan
if (prompt.trim().length > 4000) {
  return res.status(400).json({
    error: 'Prompt çok uzun. Maksimum 4000 karakter girebilirsiniz.',
    maxLength: 4000,
    currentLength: prompt.trim().length,
  });
}

// 2. Anlamlılık kontrolü — temperature: 0 ile deterministik yes/no
const validationCompletion = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{
    role: 'user',
    content: 'Is the following text a meaningful prompt that could be sent to an AI assistant? Answer with ONLY "yes" or "no":\n\n' + prompt,
  }],
  temperature: 0,
  max_tokens: 5,
});

const isValid = validationCompletion.choices[0].message.content
  .trim().toLowerCase().startsWith('yes');

if (!isValid) {
  return res.status(400).json({
    error: 'Bu metin optimize edilebilir bir prompt değil.',
  });
}
```

`temperature: 0` neden — deterministik yanıt istiyoruz, "evet mi değil mi" kararı için yaratıcılık gereksiz.

### Optimizasyon System Prompt'u

Modele verilen görev talimatı:

```javascript
// backend/src/controllers/optimizeController.js
const SYSTEM_PROMPT =
  'You are a prompt compression expert. Your ONLY job is to rewrite the given prompt using fewer words while keeping the exact same meaning and intent.\n\n' +
  'STRICT RULES:\n' +
  '- Output ONLY the compressed prompt. Nothing else.\n' +
  '- Do NOT answer the prompt. Do NOT explain. Do NOT add information.\n' +
  '- Remove filler words: "please", "can you", "could you", "lütfen", "bana", "verir misin"\n' +
  '- Keep the same language as the input\n' +
  '- Keep questions as questions, commands as commands\n' +
  '- Target 20-60% token reduction\n' +
  '- If the prompt is already minimal, return it as-is\n\n' +
  'Example:\n' +
  'Input: "Can you please explain to me in detail how machine learning works?"\n' +
  'Output: "Explain machine learning"';
```

### Görsel Analiz

```javascript
// backend/src/controllers/visionController.js

// multer: dosyayı diske yazmadan RAM'de tut
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },          // 5MB limit
  fileFilter: (_req, file, cb) => {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    ALLOWED_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new Error('Desteklenmeyen dosya türü.'));
  },
});

const analyzeImage = async (req, res) => {
  // Buffer → Base64
  const base64Image = req.file.buffer.toString('base64');
  const inlineData = { data: base64Image, mimeType: req.file.mimetype };

  // Adım 1: Validasyon — "metin var mı, uygun içerik mi?"
  const validationResult = await model.generateContent([
    { inlineData },
    'Bu görseli analiz et. Şu sorulara SADECE "evet" veya "hayır" ile cevap ver:\n' +
    '1. Görselde okunabilir metin var mı?\n' +
    '2. Bu bir market fişi, belge, ekran görüntüsü, not veya yazılı içerik mi?\n' +
    'Cevap formatı: "metin:evet/hayır, uygun:evet/hayır"',
  ]);

  if (validationText.includes('metin:hayır') || validationText.includes('uygun:hayır')) {
    return res.status(400).json({ error: 'Bu görsel analiz için uygun değil.' });
  }

  // Adım 2: OCR
  const extractResult = await model.generateContent([
    { inlineData },
    'Bu görseldeki tüm metni oku ve aynen yaz. Sadece metni yaz.',
  ]);
  const extractedText = extractResult.response.text().trim();

  // Adım 3: Gerçek token sayımı (Gemini countTokens)
  const { totalTokens: originalTokenCount } = await model.countTokens(extractedText);

  // Adım 4: Optimizasyon
  const optimizeResult = await model.generateContent(`${OPTIMIZE_PROMPT}\n\n${extractedText}`);
  const optimizedPrompt = optimizeResult.response.text().trim();

  const { totalTokens: optimizedTokenCount } = await model.countTokens(optimizedPrompt);
};
```

**Neden memory storage:** Dosyalar diske yazılmıyor, RAM'de tutulup işleniyor. Kalıcı depolama gerekmez, temizleme sorunu ortadan kalkar.

---

## 4. Frontend Teknik Detaylar

### Component Mimarisi

```
App.jsx (global state: user, darkMode, activeTab, toast)
├── Auth.jsx (giriş/kayıt formu)
├── Header.jsx (logo, info modal'ları, dark mode)
├── Sidebar.jsx (navigasyon)
└── Tab Components
    ├── Dashboard.jsx
    ├── Optimize.jsx
    ├── Summarize.jsx
    ├── Calculator.jsx
    ├── Compare.jsx
    ├── Vision.jsx
    └── History.jsx
```

**Neden Redux kullanmadık:** 4 global state var (`user`, `darkMode`, `activeTab`, `toast`). Redux bu ölçek için çok fazla boilerplate. Context API da değerlendirdim; prop drilling sadece 1-2 seviye derinlikte gerçekleşiyor, Context'in maliyeti bu projede gereksiz.

**Tab component'leri local state taşır:** Her sekmenin kendi input, result, loading state'i vardır. `Optimize.jsx`'in state'i `Summarize.jsx`'i ilgilendirmez. İzolasyon sağlıklı.

### State Yönetimi

Sayfa yenilemesi ve sekme geçişlerinde state kaybolmaması için `sessionStorage` kullanılır:

| Key | Açıklama |
|-----|----------|
| `token` | JWT auth token'ı |
| `darkMode` | Tema tercihi |
| `activeTab` | Son açık sekme |
| `promptInput` | Optimize sekmesindeki metin |
| `summarizeMessages` | Chat özetleme mesajları |

**Neden sessionStorage:** Tarayıcı kapanınca temizlenir. Oturum açık kaldığı sürece state korunur. `localStorage`'a kıyasla güvenlik riski daha düşük.

### Tailwind CSS v4

- **Utility-first:** Her class tek bir CSS özelliğini temsil eder; özel CSS yazımı minimumda
- **Dark mode:** `class` stratejisi — `<html>` elementine `dark` class'ı eklenince `dark:` prefixli sınıflar aktif olur
- **Responsive:** `md:` prefix ile tablet/masaüstü için ayrı layout. Mobil: hamburger menü + alt navigasyon. Desktop: sol sidebar

Örnek — aynı element iki tema için:

```jsx
<div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5">
```

### Token Sayımı

İki paralel yaklaşım kullanılır:

```javascript
// frontend/src/constants.jsx — anlık tahmini sayaç
export const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};
```

```javascript
// backend/src/controllers/visionController.js — gerçek sayım
const { totalTokens: originalTokenCount } = await model.countTokens(extractedText);
const { totalTokens: optimizedTokenCount } = await model.countTokens(optimizedPrompt);
```

| Yöntem | Nerede | Amaç |
|--------|--------|-------|
| `Math.ceil(text.length / 4)` | Frontend (anlık) | Kullanıcı yazarken gerçek zamanlı gösterim |
| Gemini `countTokens` API | Backend (Vision) | Gerçek token sayısı |

**Neden ikisi birlikte:** `countTokens` API çağrısı zaman alır; kullanıcı her tuşa bastığında çağrılamaz. Tahmini sayaç anında güncellenir, kesin sayı işlem sonunda gösterilir.

### Performans Optimizasyonları

**Cache:** Aynı prompt tekrar Groq'a gitmiyor → kota koruması + hız

**Promise.all:** `compareOptimize` 3 Groq isteğini paralel çalıştırır, sıralı değil:

```javascript
// backend/src/controllers/optimizeController.js
const results = await Promise.all(
  approaches.map(async (approach) => {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: `${approach.instruction}\n\n${prompt}` }],
      temperature: 0.1,
      max_tokens: 512,
    });
    const optimized = completion.choices[0].message.content.trim();
    // ... hesaplama
    return { ...approach, optimizedPrompt: optimized, savedTokens, percentage };
  })
);
```

Sıralı yapılsaydı 3x daha yavaş olurdu. `Promise.all` ile üç yaklaşım eş zamanlı hesaplanır.

---

## 5. Güvenlik

| Katman | Uygulama |
|--------|----------|
| Şifre hashleme | bcrypt, salt rounds: 10 |
| Auth | JWT, 7 günlük geçerlilik |
| Token saklama | sessionStorage (localStorage değil) |
| CORS | Sadece `http://localhost:5173` kabul edilir |
| Rate limiting | `/optimize`: dakikada 5 istek |
| Input validasyonu | 4000 karakter limiti, prompt anlamlılık kontrolü |
| Görsel validasyonu | Dosya tipi kontrolü (MIME), max 5MB, içerik uygunluk kontrolü |
| Misafir kısıtlaması | Görsel analiz ve geçmiş sadece giriş yapan kullanıcılara açık |
| Şifre exposure | `select('-password')` ile kullanıcı sorguları şifreyi döndürmez |

CORS konfigürasyonu:

```javascript
// backend/src/index.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

Şifre hiçbir zaman response'a dahil edilmez:

```javascript
// backend/src/middleware/auth.js
req.user = await User.findById(decoded.id).select('-password');
```

---

## 6. Veritabanı Tasarımı

### MongoDB Koleksiyonları

**users** — `backend/src/models/User.js`:

```javascript
const userSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now },
});
```

**histories** — `backend/src/models/History.js`:

```javascript
const historySchema = new mongoose.Schema({
  userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalPrompt:     { type: String, required: true },
  optimizedPrompt:    { type: String, required: true },
  originalTokenCount: { type: Number, required: true },
  optimizedTokenCount:{ type: Number, required: true },
  savedTokens:        { type: Number, required: true },
  percentage:         { type: Number, required: true },
  createdAt:          { type: Date, default: Date.now },
});
```

**caches** — `backend/src/models/Cache.js`:

```javascript
const cacheSchema = new mongoose.Schema({
  promptHash:          { type: String, required: true, unique: true },
  originalPrompt:      { type: String, required: true },
  originalTokenCount:  { type: Number, required: true },
  optimizedPrompt:     { type: String, required: true },
  optimizedTokenCount: { type: Number, required: true },
  savedTokens:         { type: Number, required: true },
  percentage:          { type: Number, required: true },
  createdAt:           { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
});
```

### Neden MongoDB?

- **Schema esnekliği:** Yeni alan eklenmesi migration gerektirmez
- **TTL index:** `expires: 60 * 60 * 24 * 7` ile MongoDB background worker'ı 7 günlük cache kayıtlarını otomatik siler — cron job'a gerek yok
- **Mongoose:** Schema validasyonu, pre-save hook'ları ve method tanımları için temiz API

---

## 7. İş Görüşmesi Soruları ve Cevapları

### "Bu projede en zorlandığın şey ne?"

En zorlandığım nokta Groq'un rate limiting ile cache sistemini birlikte kurgulamaktı. İlk başta her optimize isteği direkt Groq'a gidiyordu. Geliştirme sırasında dakikada 5 istek kotasını birkaç kez aştım ve 429 hatası aldım. Çözüm olarak SHA-256 hash tabanlı cache sistemi kurdum. Ama burada bir subtlety var: hash üretmeden önce `trim().toLowerCase()` uygulamak gerekiyordu — yoksa "Merhaba " ve "merhaba" farklı hash üretir, cache işe yaramazdı. Normalizasyonu unutup sonradan fark ettim.

```javascript
const promptHash = crypto
  .createHash('sha256')
  .update(prompt.trim().toLowerCase())  // normalizasyon kritik
  .digest('hex');
```

İkinci zorlu nokta Gemini Vision'ın validasyon yanıtını parse etmekti. Model bazen farklı format döndürebiliyordu. `includes()` ile loosely matching yapmak zorunda kaldım:

```javascript
if (validationText.includes('metin:hayır') || validationText.includes('uygun:hayır')) {
  return res.status(400).json({ error: 'Bu görsel analiz için uygun değil.' });
}
```

### "Rate limiting nedir, neden kullandın?"

Rate limiting, belirli bir zaman penceresinde bir kaynak veya kullanıcıdan gelen istek sayısını sınırlandırma tekniğidir. Bu projede `express-rate-limit` ile `/optimize` endpoint'ine dakikada 5 istek limiti koydum:

```javascript
const optimizeLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, ... });
const summarizeLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, ... });

router.post('/optimize', allowGuest, optimizeLimiter, analyzePrompt);
router.post('/summarize', allowGuest, summarizeLimiter, summarizeChat);
```

İki nedeni var: Birincisi koruma — Groq'un ücretsiz API kotası dakikada 30 istek, bir kullanıcı ya da bot sürekli istek gönderirse kota biter ve kimse kullanamaz. İkincisi maliyet — her optimizasyon ve özetleme Groq çağrısı yapıyor; rate limit bu maliyeti kontrol altında tutuyor.

### "JWT ve session farkı nedir?"

**Session:** Sunucu tarafında state tutulur. Kullanıcı giriş yapınca sunucu bir session ID üretir, bunu veritabanına kaydeder ve cookie'ye gönderir. Her istekte sunucu bu ID'yi DB'de arar. Ölçekleme sorunu var: farklı sunucular arasında session state paylaşmak gerekir.

**JWT:** Sunucu tarafında state tutulmaz (stateless). Token'ın içine kullanıcı ID'si şifreli olarak gömülür. Sunucu sadece imzayı doğrular, DB'ye gitmeye gerek yok:

```javascript
// Üretim — authController.js
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Doğrulama — auth.js middleware
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = await User.findById(decoded.id).select('-password');
```

Bu projede JWT seçtim çünkü tek sunucu, veritabanı sorgusu minimum tutmak istiyorum. `jwt.verify()` CPU-bound bir işlem, DB'den çok daha hızlı.

### "Cache sistemi nasıl çalışıyor?"

```javascript
// Tam akış — optimizeController.js
const promptHash = crypto.createHash('sha256')
  .update(prompt.trim().toLowerCase()).digest('hex');

const cached = await Cache.findOne({ promptHash });
if (cached) {
  return res.json({ cached: true, ...cached });  // Groq'a gitme
}

// Cache miss → Groq → kaydet
const completion = await groq.chat.completions.create({ ... });
await Cache.create({ promptHash, originalPrompt: prompt, optimizedPrompt, ... });
```

Cache schema'sındaki TTL:

```javascript
createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }
```

Bu sistemin faydası: Aynı promptun ikinci kez gelmesi Groq kotasını tüketmiyor. Popüler promptlar için yanıt süresi dramatik düşüyor.

### "Neden Groq kullandın, OpenAI değil?"

İki ana neden: hız ve maliyet.

**Maliyet:** OpenAI'nin ücretsiz API kotası yok. Geliştirme aşamasında her test gerçek para harcar. Groq'un ücretsiz katmanı dakikada 30 istek, günde 14.400 istek sunuyor — bu proje için fazlasıyla yeterli.

**Hız:** Groq, LPU (Language Processing Unit) mimarisi kullanıyor. Llama 3.3 70B'yi GPU'dan 5-10x daha hızlı çalıştırıyor. Prompt optimizasyonu kullanıcının beklediği anlık bir işlem; <1 saniye yanıt süresi önemli bir UX farkı.

```javascript
// Her iki controller'da aynı model
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  temperature: 0.1,
  max_tokens: 512,
});
```

**Kalite:** Llama 3.3 70B, prompt sıkıştırma gibi görevler için GPT-4o'ya yakın kalitede sonuç veriyor. Bu kullanım senaryosu için kalite farkı göz ardı edilebilir seviyede.

### "MongoDB'de index neden önemli?"

Index olmadan MongoDB her sorgu için koleksiyonu baştan sona tarar (collection scan) — O(n) karmaşıklık. Index ile belirli field'lara göre B-tree yapısı oluşturulur, arama O(log n)'e düşer.

Bu projede `Cache` koleksiyonunun `promptHash` field'ı `unique: true` ile işaretli; bu otomatik olarak unique index oluşturur:

```javascript
promptHash: { type: String, required: true, unique: true }
```

Yüz binlerce cache kaydı olsa bile hash ile arama milisaniyeler içinde tamamlanır.

`History` koleksiyonunda `userId` üzerinde explicit index yok; production ortamında şunu eklemek gerekir:

```javascript
historySchema.index({ userId: 1, createdAt: -1 });
```

### "React'ta state yönetimini nasıl ele aldın?"

Global state (kullanıcı bilgisi, tema, aktif sekme, toast) `App.jsx`'te `useState` ile tutulur ve prop olarak aşağı iletilir. 7 sekmenin her biri kendi local state'ini yönetir — form değerleri, API sonuçları, loading durumu izole.

Redux veya Context seçmedim çünkü prop drilling sadece 1-2 seviye derinlikte gerçekleşiyor. Basit prop geçişi bu proje için en temiz çözüm.

`sessionStorage` entegrasyonu ile state kalıcılığı sağlandı:

```javascript
// Sekme geçişlerinde form içeriği korunur
const [promptInput, setPromptInput] = useState(
  () => sessionStorage.getItem('promptInput') || ''
);

useEffect(() => {
  sessionStorage.setItem('promptInput', promptInput);
}, [promptInput]);
```

### "CORS nedir, nasıl çözdün?"

CORS (Cross-Origin Resource Sharing), tarayıcının farklı origin'lerden gelen istekleri güvenlik gerekçesiyle engellemesidir. Frontend `http://localhost:5173`'te, backend `http://localhost:5000`'de çalıştığından port farklı → farklı origin → CORS hatası.

```javascript
// backend/src/index.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

`origin: '*'` koymadım çünkü bu herhangi bir domain'in API'ye erişmesine izin verir; production'da güvenlik açığı oluşturur.

### "bcrypt neden kullandın, MD5 veya SHA256 değil?"

MD5 ve SHA256 hız için tasarlanmış hash fonksiyonlarıdır — modern GPU'lar saniyede milyarlarca MD5 hash hesaplayabilir. Bu şifre kırmak için idealdi; brute force saldırısı çok ucuz.

bcrypt ise bilerek yavaş çalışmak üzere tasarlanmış. `cost factor` (salt rounds: 10) ile her hash hesaplama ~100ms sürer:

```javascript
// backend/src/models/User.js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);  // salt rounds: 10
  next();
});
```

Ek olarak bcrypt otomatik olarak her kayıtta farklı bir salt üretir; iki kullanıcı aynı şifreyi kullansa bile hash'leri farklı olur. MD5/SHA256 ile bu salt manuel eklenmeden rainbow table saldırısına açık olurdu.

### "Projeyi nasıl ölçeklendirebilirsin?"

**Kısa vadede:**
- `History` koleksiyonuna `{ userId: 1, createdAt: -1 }` compound index ekle
- Redis cache layer'ı MongoDB önüne koy — aynı promptlar için <10ms yanıt süresi
- `.env` ile API key rotation mekanizması

**Orta vadede:**
- PM2 ile multi-process Node.js — tek sunucuda CPU core başına bir process
- Rate limiting'i Redis'e taşı — birden fazla sunucu instance'ı arasında paylaşılan sayaç
- Görsel analiz için job queue (Bull) — senkron Gemini çağrısı yerine arka planda işle

**Uzun vadede:**
- Microservice: Auth, optimize, vision ayrı servisler
- CDN üzerinden frontend dağıtımı
- MongoDB Atlas ile managed cluster, otomatik sharding

### "Test yazdın mı? Yazmadıysan neden?"

Test yazmadım. Gerekçeyi dürüstçe açıklamak gerekirse: Bu bir öğrenme ve portföy projesi, üretim ortamında çalışan bir sistem değil. Test yazma maliyeti ile kazanım dengesini kurduğumda, önce çalışan özellikler eklemek daha değerliydi.

Yazılsaydı ne yazardım:

```javascript
// Unit test örneği — Jest
describe('estimateTokens', () => {
  it('boş string için 0 döner', () => expect(estimateTokens('')).toBe(0));
  it('4 karakter için 1 token döner', () => expect(estimateTokens('test')).toBe(1));
  it('5 karakter için 2 token döner', () => expect(estimateTokens('tests')).toBe(2));
});

// Integration test örneği — supertest
it('POST /api/auth/register 201 döner', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@test.com', password: '123456' });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('token');
});
```

Mevcut riskin büyük kısmı Groq/Gemini API çağrılarında — bunları mock'lamak gerekir. Mock ile gerçek API davranışı arasındaki fark en büyük test tuzağıdır.

### "En iyi yaptığın şey ne?"

Cache sistemi ile rate limiting entegrasyonu. Bu iki katman birlikte çalışınca ücretsiz API kotası çok daha verimli kullanılıyor:

```javascript
// Cache hit → Groq'a gitme, rate limit tüketme
const cached = await Cache.findOne({ promptHash });
if (cached) return res.json({ cached: true, ...cached });

// Cache miss → rate limit devreye girer
router.post('/optimize', allowGuest, optimizeLimiter, analyzePrompt);
```

İkinci olarak çift model mimarisi — Groq'un hızı ile Gemini'nin Vision ve countTokens kapasitesini aynı pipeline'da birleştirmek, tek sağlayıcıyla elde edilemeyecek bir özellik kombinasyonu sunuyor. Görsel Analiz sekmesi bu entegrasyonun en somut örneği: Gemini görüntüyü okur ve token sayar, Gemini metni optimize eder.

---

## 8. Öğrenilen Dersler

### Neler İyi Gitti

- **İki AI sağlayıcısını birleştirme:** Groq + Gemini kombinasyonu beklenenden daha iyi çalıştı. Her servisin güçlü tarafını kullanmak doğru karardı.
- **MongoDB TTL index:** Cache temizliğini tamamen otomatik hale getirdi, cron job veya manuel temizlik yazmak zorunda kalmadım.
- **sessionStorage state persistence:** Kullanıcı deneyimini önemli ölçüde iyileştirdi; sekme yenilemede form içerikleri kaybolmuyor.
- **allowGuest middleware:** Misafir kullanıcılara sınırlı erişim sağlamak için JWT'yi opsiyonel yapan bu yaklaşım temiz ve genişletilebilir çıktı.

### Neler Farklı Yapılabilirdi

- **Hata mesajı formatı tutarsızlığı:** Backend `{ error: '...' }` döndürürken, başlangıçta `{ message: '...' }` olarak tasarlanmıştı. Frontend bu farka uyum sağladı ama standart olmak iyiydi.
- **History koleksiyonu index eksikliği:** `userId` üzerinde index olmadan büyük veri setinde yavaşlar. Baştan eklenmesi gerekirdi.
- **countTokens sadece visionController'da:** `optimizeController`'da da Gemini countTokens kullanılabilirdi; tahmin yerine gerçek değer. Hız-doğruluk dengesi bu karara yol açtı ama tutarsızlık yarattı.
- **Test yokluğu:** Groq/Gemini entegrasyon testleri mock'larla yazılabilirdi; birkaç kez API format değişikliğini geç fark ettim.

### Gelecek Geliştirmeler

- [ ] Redis cache layer (MongoDB'den daha hızlı)
- [ ] Gerçek zamanlı token sayaç (debounce + countTokens)
- [ ] Kullanıcı başına istatistik dashboard'u (grafik)
- [ ] Prompt şablonu kaydetme / paylaşma
- [ ] API key yönetim paneli
- [ ] Export (PDF/CSV) geçmiş
- [ ] Webhook ile harici entegrasyon desteği

---

## 9. Proje İstatistikleri

| Metrik | Değer |
|--------|-------|
| Toplam kaynak dosya sayısı | 32 |
| Backend dosya sayısı | 15 |
| Frontend dosya sayısı | 17 |
| Backend satır sayısı | ~610 |
| Frontend satır sayısı | ~2.225 |
| Toplam kod satırı | ~2.835 |
| Backend API endpoint | 13 |
| Frontend component | 12 |
| Frontend sekme sayısı | 7 |
| Backend npm paketi | 10 (prod) + 1 (dev) |
| Frontend npm paketi | 6 (prod) + 8 (dev) |
| Desteklenen AI modeli sayısı | 7 (MODEL_PRICES) |
| Desteklenen dil sayısı | 12 (LANGUAGES) |
| Cache TTL | 7 gün |
| Rate limit | Dakikada 5 istek |
| Max prompt uzunluğu | 4.000 karakter |
| Max görsel boyutu | 5 MB |
| JWT geçerlilik süresi | 7 gün |
| bcrypt salt rounds | 10 |

---

*Rapor tarihi: Mayıs 2026 — Promptune v1.0.0*
