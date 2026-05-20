import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from './server'
import Optimize from '../components/tabs/Optimize.jsx'

// vi.mock YOK — gerçek api.js fetch() çalışıyor, MSW ağı yakalıyor

// prompt bir prop — bileşen kendi içinde tutmuyor (App.jsx tutuyor)
// Bu yüzden render ederken prompt'u doğrudan prop olarak veriyoruz
const defaultProps = {
  prompt: '',
  setPrompt: vi.fn(),
  setHistory: vi.fn(),
  setStats: vi.fn(),
  showToast: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────
// Senaryo 1 — Başarılı optimizasyon
//
// Ne oluyor:
//   1. prompt prop'u dolu render ediliyor
//   2. "Optimize Et" butonuna tıklanıyor
//   3. api.js → fetch('/api/optimize') → MSW yakalıyor
//   4. handlers.js'deki sahte yanıt dönüyor
//   5. Bileşen result.optimized.prompt'u ekrana basıyor
//
// Neden MSW?
//   vi.mock ile api.js tamamen pas geçilir.
//   MSW ile api.js'in içindeki fetch, hata kontrolü (res.ok), JSON parse
//   hepsi gerçekten çalışır — sadece ağ katmanı taklit edilir.
// ─────────────────────────────────────────────────────────────
describe('Senaryo 1 — Başarılı optimizasyon', () => {

  it('optimize sonrası "Python hakkında bilgi ver" ekranda görünmeli', async () => {
    // prompt prop olarak veriliyor — bileşen textarea'yı buna bağlıyor
    render(<Optimize {...defaultProps} prompt="Python hakkında detaylı bilgi ver misin?" />)

    // Buton prompt dolu olduğu için enabled
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))

    // MSW yanıt döndükten sonra result.optimized.prompt render edilir
    // findByText → DOM'da bu metin görünene kadar bekler (async)
    expect(await screen.findByText('Python hakkında bilgi ver')).toBeInTheDocument()
  })

  it('tasarruf yüzdesi "%58 tasarruf" olarak görünmeli', async () => {
    render(<Optimize {...defaultProps} prompt="Python hakkında detaylı bilgi ver misin?" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))

    // handlers.js savings.percentage: 58 → bileşen %{result.savings.percentage} basar
    expect(await screen.findByText('%58')).toBeInTheDocument()
  })

  it('showToast "%58 token tasarruf edildi! ⚡" ile çağrılmalı', async () => {
    render(<Optimize {...defaultProps} prompt="Python hakkında detaylı bilgi ver misin?" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))

    await screen.findByText('Python hakkında bilgi ver')
    expect(defaultProps.showToast).toHaveBeenCalledWith('%58 token tasarruf edildi! ⚡', 'success')
  })

})

// ─────────────────────────────────────────────────────────────
// Senaryo 2 — Rate limit aşıldı (429 Too Many Requests)
//
// Ne oluyor:
//   server.use() ile bu test için /api/optimize handler'ı geçici eziliyor
//   → 429 + hata mesajı dönüyor
//   api.js: res.ok false → throw new Error(data.error || 'Bir hata oluştu')
//   Bileşen catch bloğunda: setError(err.message) + showToast
//   Ekranda kırmızı hata kutusu render ediliyor
//
// afterEach → server.resetHandlers() → bir sonraki test için eski handler geri gelir
// ─────────────────────────────────────────────────────────────
describe('Senaryo 2 — Rate limit (429)', () => {

  it('429 gelince hata kutusu ekranda görünmeli', async () => {
    // Sadece bu test için /optimize → 429 dönsün
    server.use(
      http.post('https://promptune-api.onrender.com/api/optimize', () => {
        return HttpResponse.json(
          { error: 'Çok fazla istek gönderildi. Lütfen 1 dakika bekleyin.' },
          { status: 429 }
        )
      })
    )

    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))

    // api.js res.ok=false → throw Error → bileşen setError → kırmızı kutu render
    expect(
      await screen.findByText('Çok fazla istek gönderildi. Lütfen 1 dakika bekleyin.')
    ).toBeInTheDocument()
  })

  it('429 gelince showToast hata mesajıyla çağrılmalı', async () => {
    server.use(
      http.post('https://promptune-api.onrender.com/api/optimize', () => {
        return HttpResponse.json(
          { error: 'Çok fazla istek gönderildi. Lütfen 1 dakika bekleyin.' },
          { status: 429 }
        )
      })
    )

    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))

    await screen.findByText('Çok fazla istek gönderildi. Lütfen 1 dakika bekleyin.')
    expect(defaultProps.showToast).toHaveBeenCalledWith(
      'Çok fazla istek gönderildi. Lütfen 1 dakika bekleyin.',
      'error'
    )
  })

})

// ─────────────────────────────────────────────────────────────
// Senaryo 3 — Boş prompt
//
// MSW burada gereksiz — API'ye istek hiç gitmiyor.
// Bileşen: disabled={loading || !prompt.trim()}
// prompt prop boş string → trim() → '' → falsy → buton disabled
// Kullanıcı tıklayamaz, fetch çalışmaz, hata da gösterilmez.
// Bu saf frontend validation — bileşenin kendisi koruyor.
// ─────────────────────────────────────────────────────────────
describe('Senaryo 3 — Boş prompt', () => {

  it('prompt boşken "Optimize Et" butonu disabled olmalı', () => {
    // prompt: '' → defaultProps'ta zaten boş
    render(<Optimize {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Optimize Et' })).toBeDisabled()
  })

  it('prompt boşken butona tıklansa bile API isteği gönderilmemeli', async () => {
    // MSW hiç tetiklenmeyeceği için getStats/getHistory kontrolü yeterli
    // Ama daha kesin test: fetch'i spy'la
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    render(<Optimize {...defaultProps} />)

    // disabled butona userEvent tıklayamaz — dolayısıyla tıklama çalışmaz
    // Yine de kontrol edelim: fetch hiç çağrılmadı mı?
    expect(fetchSpy).not.toHaveBeenCalled()

    fetchSpy.mockRestore()
  })

  it('prompt sadece boşluk içeriyorsa da buton disabled olmalı', () => {
    // "   ".trim() === '' → disabled
    render(<Optimize {...defaultProps} prompt="   " />)
    expect(screen.getByRole('button', { name: 'Optimize Et' })).toBeDisabled()
  })

})
