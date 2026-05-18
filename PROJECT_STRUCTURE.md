# Promptune — Proje Yapısı

```
promptune/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── historyController.js
│   │   │   ├── modelController.js
│   │   │   ├── optimizeController.js
│   │   │   ├── summaryController.js
│   │   │   └── visionController.js
│   │   ├── data/
│   │   │   └── models.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── rateLimiter.js
│   │   ├── models/
│   │   │   ├── Cache.js
│   │   │   ├── History.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── tabs/
│   │   │   │   ├── Calculator.jsx
│   │   │   │   ├── Compare.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── History.jsx
│   │   │   │   ├── Optimize.jsx
│   │   │   │   ├── Summarize.jsx
│   │   │   │   └── Vision.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Toast.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── constants.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── TECHNICAL_REPORT.md
├── PROJECT_STRUCTURE.md
└── package.json
```

---

## Backend

### `backend/src/index.js`
Uygulamanın giriş noktası. Express sunucusunu başlatır, CORS middleware'ini yapılandırır (`http://localhost:5173`), JSON body parser ekler ve tüm route'ları `/api` prefix'i altında bağlar. Port 5000'de çalışır.

### `backend/src/config/db.js`
MongoDB bağlantısını kurar. `mongoose.connect()` çağrısını yapar; bağlantı başarılı veya başarısız olduğunda konsola log yazar.

---

### Controllers

### `backend/src/controllers/authController.js`
Kullanıcı kayıt ve giriş işlemlerini yönetir.
- `register` — Email/şifre alır, mevcut kullanıcı kontrolü yapar, `User.create()` ile kaydeder, JWT üretir
- `login` — Email/şifre doğrular, bcrypt ile karşılaştırır, JWT döner
- `me` — `req.user`'dan giriş yapan kullanıcının bilgilerini döner
- `signToken` — `jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' })` ile token üretir

### `backend/src/controllers/optimizeController.js`
Ana optimizasyon mantığını içerir. Projenin en büyük controller dosyası.
- `analyzePrompt` — Prompt alır → normalize eder → SHA-256 hash ile cache'de arar → cache hit'te direkt döner, miss'te Groq Llama 3.3 70B ile optimize eder → Cache ve History koleksiyonlarına kaydeder. İsteğe bağlı hedef dil desteği var (translateCompletion).
- `compareOptimize` — Aynı promptu 3 farklı yaklaşımla (Agresif / Dengeli / Minimal) `Promise.all` ile paralel optimize eder
- `SYSTEM_PROMPT` — Modele verilen sıkıştırma talimatları; sayılar ve format kısıtlamalarını koruma kuralları içerir

### `backend/src/controllers/summaryController.js`
Chat konuşmalarını özetler.
- `summarizeChat` — Mesaj dizisi alır (minimum 4 mesaj), `Kullanıcı: ... / Asistan: ...` formatına dönüştürür, Groq ile 2-3 cümlelik özet üretir, token tasarrufu hesaplayıp döner

### `backend/src/controllers/visionController.js`
Görsel analiz pipeline'ını yönetir.
- `upload` — multer konfigürasyonu; memory storage (diske yazmaz), 5MB limit, JPEG/PNG/WEBP/GIF filtresi
- `analyzeImage` — Buffer → Base64 → Gemini validasyon → OCR → `countTokens` → optimizasyon → `countTokens` akışını çalıştırır. Gerçek token sayımı için Gemini `countTokens` API kullanır.

### `backend/src/controllers/historyController.js`
Kullanıcı geçmişini ve platform istatistiklerini yönetir.
- `getHistory` — Giriş yapan kullanıcının geçmişini tarihe göre sıralı döner
- `deleteHistory` — Kullanıcının tüm geçmiş kayıtlarını siler
- `getStats` — Platform geneli toplam optimizasyon sayısı, toplam tasarruf ve ortalama yüzde döner

### `backend/src/controllers/modelController.js`
Model karşılaştırma önerisini hesaplar.
- `getModels` — `data/models.js`'teki model listesini döner
- `compareModels` — Token sayısı ve görev tipine göre en uygun modeli önerir, maliyet hesaplaması yapar

---

### Middleware

### `backend/src/middleware/auth.js`
İki middleware fonksiyonu içerir.
- `protect` — Authorization header'ından Bearer token okur, `jwt.verify()` ile doğrular, `req.user`'a kullanıcıyı atar. Token yoksa veya geçersizse 401 döner.
- `allowGuest` — Token varsa doğrular, yoksa `req.isGuest = true` set eder ve devam ettirir. Misafir kullanıcılara izin vermesi gereken route'larda kullanılır.

### `backend/src/middleware/rateLimiter.js`
`express-rate-limit` tabanlı iki limiter.
- `optimizeLimiter` — `/optimize` route'u için dakikada 5 istek
- `summarizeLimiter` — `/summarize` route'u için dakikada 5 istek

---

### Models

### `backend/src/models/User.js`
Kullanıcı şeması. `email` (unique, lowercase, trim), `password` (minlength: 6). `pre('save')` hook'u ile şifreyi bcrypt salt rounds 10 ile otomatik hash'ler. `comparePassword` instance metodu bcrypt karşılaştırması yapar.

### `backend/src/models/History.js`
Optimizasyon geçmiş kaydı şeması. `userId` ile User'a referans tutar. `originalPrompt`, `optimizedPrompt`, token sayıları, tasarruf miktarı ve yüzdesi saklanır.

### `backend/src/models/Cache.js`
Prompt cache şeması. `promptHash` (SHA-256 hex, unique index) ile hızlı lookup sağlar. `createdAt` field'ında `expires: 604800` TTL index var — MongoDB 7 gün sonra kaydı otomatik siler.

---

### Routes

### `backend/src/routes/index.js`
Tüm API endpoint'lerini tek dosyada tanımlar. 13 route: auth (3), optimize (2), summarize (1), models (2), vision (1), history (2), stats (1), health (1). Her route'a uygun middleware zinciri eklenir (`protect`, `allowGuest`, `optimizeLimiter`, `summarizeLimiter`).

---

### Data

### `backend/src/data/models.js`
AI model veritabanı. Her model için `id`, `name`, `provider`, `contextWindow`, `strengths`, `weaknesses`, `pricing` bilgilerini içeren statik veri dosyası. `modelController` bu verilerden karşılaştırma yapar.

---

## Frontend

### `frontend/src/main.jsx`
React uygulamasının giriş noktası. `ReactDOM.createRoot` ile `App.jsx`'i `#root` elementine bağlar.

### `frontend/src/App.jsx`
Global state yönetim merkezi. `user`, `isGuest`, `darkMode`, `activeTab`, `toast`, `stats`, `history` state'lerini tutar. `sessionStorage` ile kalıcılık sağlar. Giriş durumuna göre `Auth.jsx` veya ana layout'u render eder.

### `frontend/src/constants.jsx`
Uygulama genelinde kullanılan sabitler ve yardımcı fonksiyonlar.
- `LANGUAGES` — 12 dil seçeneği (optimize çevirisi için)
- `CALC_SCENARIOS` — Token hesaplayıcı örnek senaryoları
- `MODEL_PRICES` — 7 modelin fiyat bilgisi (hesaplama için)
- `TASK_TYPES` — Model karşılaştırma görev tipleri
- `TEMPLATES` — 9 hazır prompt şablonu
- `btn` — Tekrar eden Tailwind button class'ları
- `TABS` — Sidebar navigasyon item'ları (ikon + label)
- `TAB_DESCRIPTIONS` / `TAB_HEADERS` — Sekme açıklamaları
- `estimateTokens` — `Math.ceil(text.length / 4)` tahmini sayaç

### `frontend/src/index.css`
Tailwind direktifleri ve özel animasyonlar. `blob-orange`, `blob-yellow`, `blob-purple` arka plan blob animasyonları ve `toast-animate` toast giriş animasyonu.

---

### Components

### `frontend/src/components/Auth.jsx`
Giriş/kayıt formu. Tab yapısıyla giriş ve kayıt arasında geçiş yapar. Form submit'te `api.login` veya `api.register` çağırır, başarıda `sessionStorage`'a token yazar ve `setUser` ile `setIsGuest` günceller.

### `frontend/src/components/Header.jsx`
Üst navigasyon çubuğu. Logo, 4 bilgi butonu (Nasıl Çalışır, Fiyatlandırma, Gizlilik, Hakkında) ve dark mode toggle içerir. Bilgi butonları `activeModal` state'i ile modal açar; her modal kendi içeriğini render eder.

### `frontend/src/components/Sidebar.jsx`
Sol navigasyon (masaüstü) ve alt navigasyon (mobil). `TABS` sabitinden tab listesini render eder. Aktif tab için turuncu vurgu uygular. Mobil'de `mobileMenuOpen` state'e göre açılıp kapanır.

### `frontend/src/components/EmptyState.jsx`
Sonuç yokken gösterilen boş durum bileşeni. İkon, başlık ve açıklama prop'ları alır. 5 tab'da ortak kullanılır.

### `frontend/src/components/Toast.jsx`
Bildirim bileşeni. `message`, `type` (success/error/info) ve `onClose` prop'ları alır. `toast-animate` CSS animasyonuyla kayarak girer.

---

### Tab Components

### `frontend/src/components/tabs/Dashboard.jsx`
Ana ekran. Misafir kullanıcı uyarısı, 3 istatistik kartı (toplam optimizasyon, token tasarrufu, ortalama yüzde) ve sekme kısayolları gösterir. Her 5 saniyede dönen ipucu sistemi modül-düzeyinde `TIPS` sabitinden çalışır.

### `frontend/src/components/tabs/Optimize.jsx`
Ana optimizasyon sekmesi. Textarea, karakter/token sayacı, dil seçici dropdown (12 dil, kaydırılabilir), şablon seçici, optimize butonu içerir. Sonuç bölümü: token karşılaştırma satırı → optimize edilmiş prompt kutusu → tasarruf satırı. Sayı animasyonu easing ile yumuşatılır. `sessionStorage` ile textarea içeriği korunur.

### `frontend/src/components/tabs/Summarize.jsx`
Chat özetleme sekmesi. Mesaj girişi (kullanıcı/asistan rolü seçimiyle), mesaj listesi ve özetleme butonu içerir. Minimum 4 mesaj şartı var. `sessionStorage` ile mesajlar korunur.

### `frontend/src/components/tabs/Calculator.jsx`
Token maliyet hesaplayıcı. Girdi token, çıktı token, günlük istek sayısı input'ları ve hazır senaryo butonları içerir. Hesaplama sonucu 7 modeli maliyete göre sıralar; en ucuz model turuncu badge ile vurgulanır. Aylık tahmini maliyet de gösterilir.

### `frontend/src/components/tabs/Compare.jsx`
İki mod içerir: model karşılaştırma (görev tipi + token sayısına göre öneri) ve yaklaşım karşılaştırma (aynı promptu 3 stratejiyle optimize eder). Her iki mod için EmptyState gösterir.

### `frontend/src/components/tabs/Vision.jsx`
Görsel analiz sekmesi. Sürükle-bırak veya tıklayarak görsel yükleme, görsel önizleme, analiz butonu ve sonuç gösterimi içerir. Sadece giriş yapan kullanıcılara açık; misafir kullanıcıya uyarı gösterir.

### `frontend/src/components/tabs/History.jsx`
Optimizasyon geçmişi. Mount'ta `api.getHistory()` çağırır, kayıtları listeler. Her kayıtta orijinal/optimize prompt, token sayıları ve tasarruf gösterilir. Tüm geçmişi silme butonu içerir.

---

### Services

### `frontend/src/services/api.js`
Backend ile iletişim katmanı. `sessionStorage`'dan token okuyarak `Authorization: Bearer` header'ı ekler. 10 fonksiyon:

| Fonksiyon | Endpoint | Açıklama |
|-----------|----------|----------|
| `register` | POST `/auth/register` | Kullanıcı kaydı |
| `login` | POST `/auth/login` | Giriş |
| `getMe` | GET `/auth/me` | Kullanıcı bilgisi |
| `optimizePrompt` | POST `/optimize` | Prompt optimizasyonu |
| `compareOptimizations` | POST `/optimize/compare` | 3 yaklaşım karşılaştırması |
| `summarizeChat` | POST `/summarize` | Chat özetleme |
| `compareModels` | POST `/models/compare` | Model önerisi |
| `analyzeImage` | POST `/vision` | Görsel analiz (FormData) |
| `getHistory` | GET `/history` | Geçmiş listesi |
| `deleteHistory` | DELETE `/history` | Geçmiş temizleme |
| `getStats` | GET `/stats` | Platform istatistikleri |

---

## Root

### `package.json` (root)
`concurrently` ile backend ve frontend'i tek komutla çalıştırır:
```
npm run dev → concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

### `TECHNICAL_REPORT.md`
Projenin tüm teknik kararlarını, mimari seçimlerini, güvenlik katmanlarını ve iş görüşmesi sorularına cevapları içeren detaylı teknik rapor.

### `PROJECT_STRUCTURE.md`
Bu dosya. Klasör yapısını ve her dosyanın görevini açıklar.
