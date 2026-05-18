# Promptune

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
npm install
cd backend && npm install
cd ../frontend && npm install

# .env dosyasını oluştur
cp backend/.env.example backend/.env
# backend/.env içine GROQ_API_KEY, GEMINI_API_KEY, MONGODB_URI, JWT_SECRET ekle

# Geliştirme sunucusunu başlat
npm run dev
```

Backend `http://localhost:5000`, frontend `http://localhost:5173` adresinde çalışır.

## Ortam Değişkenleri

```
GROQ_API_KEY=
GEMINI_API_KEY=
MONGODB_URI=
JWT_SECRET=
PORT=5000
```
