import { http, HttpResponse } from 'msw'

// BASE_URL — Promptune backend'inin adresi
// Test ortamında tam URL lazım
const BASE = 'https://promptune-api.onrender.com/api'

export const handlers = [

  // ─── POST /api/auth/login ───────────────────────────────
  // Gerçek yanıt: { token: "...", user: { id, email } }
  http.post(`${BASE}/auth/login`, () => {
    return HttpResponse.json(
      {
        token: 'sahte-jwt-token-12345',
        user: {
          id: 'kullanici-id-001',
          email: 'test@test.com'
        }
      },
      { status: 200 }  // HTTP 200 OK
    )
  }),

  // ─── POST /api/auth/register ────────────────────────────
  // Gerçek yanıt: { token: "...", user: { id, email } }
  http.post(`${BASE}/auth/register`, () => {
    return HttpResponse.json(
      {
        token: 'sahte-jwt-token-67890',
        user: {
          id: 'kullanici-id-002',
          email: 'yeni@test.com'
        }
      },
      { status: 201 }  // 201 Created — teknik rapordaki gerçek response
    )
  }),

  // ─── GET /api/stats ─────────────────────────────────────
  // Auth gerektirmiyor — herkese açık
  http.get(`${BASE}/stats`, () => {
    return HttpResponse.json({
      totalOptimizations: 1247,
      totalTokensSaved:   89432,
      avgReductionRate:   34.5
    })
  }),

  // ─── POST /api/optimize ─────────────────────────────────
  // allowGuest — giriş yapmadan da çalışır
  // Bileşen result.optimized.prompt, result.savings.percentage, result.savings.tokens kullanıyor
  http.post(`${BASE}/optimize`, () => {
    return HttpResponse.json({
      original:  { prompt: 'Lütfen bana Python hakkında detaylı bilgi verir misiniz?', tokenCount: 12 },
      optimized: { prompt: 'Python hakkında bilgi ver', tokenCount: 5 },
      savings:   { percentage: 58, tokens: 7 },
      cached: false,
    })
  }),

]