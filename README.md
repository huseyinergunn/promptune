# Promptune

[![Promptune Tests](https://github.com/huseyinergunn/promptune/actions/workflows/test.yml/badge.svg)](https://github.com/huseyinergunn/promptune/actions/workflows/test.yml)
[![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18)](https://vitest.dev)
[![Frontend Coverage](https://img.shields.io/badge/frontend%20coverage-55%25-brightgreen)]()
[![Backend Coverage](https://img.shields.io/badge/backend%20coverage-57%25-brightgreen)]()

**Less tokens, more intelligence.**

Yapay zeka kullanıcılarının promptlarını optimize ederek token maliyetlerini düşüren web uygulaması.

## Özellikler

- **Prompt Optimizasyon** — Groq Llama 3.3 70B ile gereksiz kelimeleri kaldırır, anlamı korur
- **3 Yaklaşım Karşılaştırma** — Agresif / Dengeli / Minimal optimizasyon seçenekleri
- **Chat Özetleme** — Uzun konuşmaları kısa özete dönüştürür
- **Görsel Analiz** — Gemini Vision ile görseldeki metni okur ve optimize eder
- **Token Hesaplayıcı** — 7 farklı model için maliyet karşılaştırması
- **Model Karşılaştırma** — Görev tipine göre model önerisi
- **Geçmiş & İstatistikler** — Tüm optimizasyonları kaydeder

## Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Veritabanı | MongoDB + Mongoose |
| AI | Groq Llama 3.3 70B + Gemini 2.5 Flash |
| Auth | JWT + bcrypt |

## Kurulum

```bash
# Bağımlılıkları yükle
cd backend && npm install
cd ../frontend && npm install

# .env dosyasını oluştur (backend/.env.example'dan kopyala)
cp backend/.env.example backend/.env
# GROQ_API_KEY, GEMINI_API_KEY, MONGODB_URI, JWT_SECRET ekle

# Geliştirme sunucusunu başlat
cd backend && npm run dev   # → http://localhost:5000
cd frontend && npm run dev  # → http://localhost:5173
```

## Ortam Değişkenleri

```
GROQ_API_KEY=
GEMINI_API_KEY=
MONGODB_URI=
JWT_SECRET=
PORT=5000
```

---

## Testler

Proje hem frontend hem backend için **%50+ coverage** hedefiyle yazılmış kapsamlı bir test suite'e sahiptir. Testler her `push` ve `pull_request`'te GitHub Actions üzerinde otomatik çalışır.

### Sonuçlar

| Taraf | Test Sayısı | Statement Coverage |
|-------|-------------|-------------------|
| Frontend | 136 test | %55 |
| Backend | 29 test | %57 |

### Araçlar

| Araç | Amaç |
|------|------|
| [Vitest](https://vitest.dev) | Test runner (frontend + backend) |
| [@testing-library/react](https://testing-library.com) | React bileşen testleri |
| [MSW](https://mswjs.io) | HTTP isteklerini mock'lama |
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage) | Coverage raporu |

### Testleri Çalıştırma

```bash
# Frontend
cd frontend
npm run test        # watch modu
npm run test:run    # tek seferlik
npm run coverage    # coverage raporu (HTML + terminal)

# Backend
cd backend
npm run test        # watch modu
npm run test:run    # tek seferlik
npm run coverage    # coverage raporu
```

### Test Yapısı

```
frontend/src/test/
├── setup.js              # jest-dom + MSW server kurulumu
├── server.js             # MSW node server
├── handlers.js           # HTTP handler'ları (API mock)
├── Auth.test.jsx         # Giriş/kayıt form testleri
├── Auth.msw.test.jsx     # Auth — gerçek fetch + MSW
├── Dashboard.test.jsx    # Dashboard bileşen testleri
├── Optimize.test.jsx     # Prompt optimizasyon testleri
├── Optimize.msw.test.jsx # Optimizasyon — MSW ile uçtan uca
├── Summarize.test.jsx    # Chat özetleme testleri
├── Calculator.test.jsx   # Token hesaplayıcı testleri
├── Sidebar.test.jsx      # Navigasyon testleri
├── History.test.jsx      # Geçmiş sayfası testleri
├── Vision.test.jsx       # Görsel analiz testleri
└── Toast.test.jsx        # Bildirim bileşen testleri

backend/src/test/
├── health.test.js            # GET /health endpoint
├── auth.test.js              # Kayıt endpoint'i
├── authMiddleware.test.js    # protect + allowGuest middleware
├── modelController.test.js   # Model listeleme + karşılaştırma
├── historyController.test.js # Geçmiş getirme + silme
└── getStats.test.js          # İstatistik hesaplama
```

### Örnek: Bileşen Testi

```jsx
// frontend/src/test/Toast.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '../components/Toast.jsx'

it('✕ butonuna tıklayınca onClose çağrılmalı', async () => {
  const onClose = vi.fn()
  render(<Toast toast={{ type: 'success', message: 'Test' }} onClose={onClose} />)
  await userEvent.click(screen.getByRole('button'))
  expect(onClose).toHaveBeenCalledTimes(1)
})
```

### Örnek: MSW ile Uçtan Uca Test

```jsx
// frontend/src/test/Optimize.msw.test.jsx
// Gerçek fetch çalışır — MSW ağ katmanında yakalayıp sahte yanıt döner

it('başarılı optimizasyonda sonuç ekranda görünmeli', async () => {
  render(<Optimize showToast={vi.fn()} setStats={vi.fn()} />)
  await userEvent.type(screen.getByRole('textbox'), 'Python hakkında bilgi ver')
  await userEvent.click(screen.getByRole('button', { name: /optimize et/i }))
  await waitFor(() =>
    expect(screen.getByText('Python hakkında bilgi ver')).toBeInTheDocument()
  )
})
```

### Örnek: Backend Controller Testi

```js
// backend/src/test/getStats.test.js
const { getStats } = require('../controllers/historyController')

vi.mock('../models/History', () => ({
  countDocuments: vi.fn(),
  find: vi.fn(),
}))

it('avgPercentage doğru yuvarlanmalı', async () => {
  vi.spyOn(History, 'countDocuments').mockResolvedValue(2)
  vi.spyOn(History, 'find').mockResolvedValue([
    { savedTokens: 10, percentage: 33 },
    { savedTokens: 10, percentage: 34 },
  ])

  const res = makeRes()
  await getStats({}, res)

  // (33 + 34) / 2 = 33.5 → Math.round → 34
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ avgPercentage: 34 })
  )
})
```

### Örnek: Middleware Testi

```js
// backend/src/test/authMiddleware.test.js
it('geçerli token varsa req.user set edilmeli ve next çağrılmalı', async () => {
  vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'user123' })
  vi.spyOn(User, 'findById').mockReturnValue({
    select: vi.fn().mockResolvedValue({ _id: 'user123', email: 'a@b.com' })
  })

  const req = { headers: { authorization: 'Bearer valid-token' } }
  const next = vi.fn()
  await protect(req, makeRes(), next)

  expect(req.user).toEqual({ _id: 'user123', email: 'a@b.com' })
  expect(next).toHaveBeenCalled()
})
```

### CI — GitHub Actions

Her `push` ve `pull request`'te frontend ve backend testleri paralel olarak çalışır:

```yaml
# .github/workflows/test.yml
jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: ./frontend
      - run: npm run test:run
        working-directory: ./frontend

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: ./backend
      - run: npm run test:run
        working-directory: ./backend
```

Badge'in durumu workflow her çalıştığında otomatik güncellenir:

```
https://github.com/huseyinergunn/promptune/actions/workflows/test.yml/badge.svg
```
