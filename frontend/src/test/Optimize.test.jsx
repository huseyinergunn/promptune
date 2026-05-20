import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Optimize from '../components/tabs/Optimize.jsx'

vi.mock('../services/api', () => ({
  optimizePrompt: vi.fn(),
  getStats: vi.fn(),
  getHistory: vi.fn(),
}))

import { optimizePrompt, getStats, getHistory } from '../services/api'

const defaultProps = {
  prompt: '',
  setPrompt: vi.fn(),
  setHistory: vi.fn(),
  setStats: vi.fn(),
  showToast: vi.fn(),
}

const fakeResult = {
  original:  { prompt: 'Lütfen bana Python hakkında detaylı bilgi verir misiniz?', tokenCount: 12 },
  optimized: { prompt: 'Python hakkında bilgi ver', tokenCount: 5 },
  savings:   { percentage: 58, tokens: 7 },
  cached: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  getStats.mockResolvedValue({})
  getHistory.mockResolvedValue({ history: [] })
})

describe('Optimize — render', () => {

  it('başlık ve alt başlık görünmeli', () => {
    render(<Optimize {...defaultProps} />)
    expect(screen.getByText('Prompt Optimize')).toBeInTheDocument()
    expect(screen.getByText('Gereksiz kelimeleri kaldırarak token tasarrufu edin')).toBeInTheDocument()
  })

  it('textarea render edilmeli', () => {
    render(<Optimize {...defaultProps} />)
    expect(screen.getByPlaceholderText("Prompt'unuzu buraya yazın...")).toBeInTheDocument()
  })

  it('token sayacı etiketi görünmeli', () => {
    render(<Optimize {...defaultProps} />)
    expect(screen.getByText(/~0 token · 0 \/ 4000/)).toBeInTheDocument()
  })

  it('"Optimize Et" butonu render edilmeli', () => {
    render(<Optimize {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Optimize Et' })).toBeInTheDocument()
  })

  it('"Şablonlar" butonu render edilmeli', () => {
    render(<Optimize {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Şablonlar' })).toBeInTheDocument()
  })

  it('dil seçici dropdown butonu render edilmeli', () => {
    render(<Optimize {...defaultProps} />)
    expect(screen.getByText('🌐 Orijinal dil')).toBeInTheDocument()
  })

  it('başlangıçta EmptyState görünmeli', () => {
    render(<Optimize {...defaultProps} />)
    expect(screen.getByText("Prompt'unuzu yazın ve optimize edin")).toBeInTheDocument()
    expect(screen.getByText('Gereksiz kelimeler kaldırılır, token tasarrufu hesaplanır')).toBeInTheDocument()
  })

})

describe('Optimize — "Optimize Et" butonu', () => {

  it('prompt boşken disabled olmalı', () => {
    render(<Optimize {...defaultProps} prompt="" />)
    expect(screen.getByRole('button', { name: 'Optimize Et' })).toBeDisabled()
  })

  it('prompt dolunca enabled olmalı', () => {
    render(<Optimize {...defaultProps} prompt="test metni" />)
    expect(screen.getByRole('button', { name: 'Optimize Et' })).toBeEnabled()
  })

  it('loading sırasında "Optimize ediliyor..." yazmalı ve disabled olmalı', async () => {
    // asla resolve etmeyen promise → loading sonsuza takılır
    optimizePrompt.mockImplementation(() => new Promise(() => {}))

    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))

    const btn = screen.getByRole('button', { name: 'Optimize ediliyor...' })
    expect(btn).toBeInTheDocument()
    expect(btn).toBeDisabled()
  })

})

describe('Optimize — şablonlar', () => {

  it('"Şablonlar" butonuna tıklayınca şablon listesi açılmalı', async () => {
    render(<Optimize {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Şablonlar' }))
    // constants.jsx'teki ilk şablon etiketi
    expect(screen.getByRole('button', { name: 'E-posta yaz' })).toBeInTheDocument()
  })

  it('bir şablona tıklayınca setPrompt o şablonun metniyle çağrılmalı', async () => {
    render(<Optimize {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Şablonlar' }))
    await userEvent.click(screen.getByRole('button', { name: 'E-posta yaz' }))
    // setPrompt, seçilen şablonun prompt metniyle çağrılmalı
    expect(defaultProps.setPrompt).toHaveBeenCalledWith(
      'Profesyonel bir iş e-postası yaz. Konu: [KONU]. Alıcı: [ALICI]. İçerik: [İÇERİK].'
    )
  })

  it('şablon seçince liste kapanmalı', async () => {
    render(<Optimize {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Şablonlar' }))
    await userEvent.click(screen.getByRole('button', { name: 'E-posta yaz' }))
    expect(screen.queryByRole('button', { name: 'E-posta yaz' })).not.toBeInTheDocument()
  })

})

describe('Optimize — başarılı optimizasyon', () => {

  beforeEach(() => {
    optimizePrompt.mockResolvedValue(fakeResult)
  })

  it('EmptyState kaybolmalı', async () => {
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    await screen.findByText('Python hakkında bilgi ver')
    expect(screen.queryByText("Prompt'unuzu yazın ve optimize edin")).not.toBeInTheDocument()
  })

  it('optimize edilmiş prompt metni render edilmeli', async () => {
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    expect(await screen.findByText('Python hakkında bilgi ver')).toBeInTheDocument()
  })

  it('tasarruf yüzdesi "%58" olarak görünmeli', async () => {
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    expect(await screen.findByText('%58')).toBeInTheDocument()
  })

  it('"7 token kazanıldı" görünmeli', async () => {
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    await screen.findByText('Python hakkında bilgi ver')
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('showToast "%58 token tasarruf edildi! ⚡" ile çağrılmalı', async () => {
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    await screen.findByText('Python hakkında bilgi ver')
    expect(defaultProps.showToast).toHaveBeenCalledWith('%58 token tasarruf edildi! ⚡', 'success')
  })

  it('başarı sonrası getStats çağrılmalı', async () => {
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    await screen.findByText('Python hakkında bilgi ver')
    expect(getStats).toHaveBeenCalled()
  })

  it('başarı sonrası getHistory çağrılmalı', async () => {
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    await screen.findByText('Python hakkında bilgi ver')
    expect(getHistory).toHaveBeenCalled()
  })

})

describe('Optimize — hata durumu', () => {

  it('API hata fırlatınca hata kutusu görünmeli', async () => {
    optimizePrompt.mockRejectedValue(new Error('Bir hata oluştu'))
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    expect(await screen.findByText('Bir hata oluştu')).toBeInTheDocument()
  })

  it('API hata fırlatınca showToast hata mesajıyla çağrılmalı', async () => {
    optimizePrompt.mockRejectedValue(new Error('Bir hata oluştu'))
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    await screen.findByText('Bir hata oluştu')
    expect(defaultProps.showToast).toHaveBeenCalledWith('Bir hata oluştu', 'error')
  })

})

describe('Optimize — kopyala butonu', () => {

  beforeEach(() => {
    optimizePrompt.mockResolvedValue(fakeResult)
    // jsdom'da navigator.clipboard yok — mock'luyoruz
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('sonuç geldikten sonra "Kopyala" butonu görünmeli', async () => {
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    expect(await screen.findByRole('button', { name: 'Kopyala' })).toBeInTheDocument()
  })

  it('"Kopyala" tıklanınca "✓ Kopyalandı!" yazmalı', async () => {
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Kopyala' }))
    expect(screen.getByRole('button', { name: '✓ Kopyalandı!' })).toBeInTheDocument()
  })

  it('showToast "Panoya kopyalandı! 📋" ile çağrılmalı', async () => {
    render(<Optimize {...defaultProps} prompt="test" />)
    await userEvent.click(screen.getByRole('button', { name: 'Optimize Et' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Kopyala' }))
    expect(defaultProps.showToast).toHaveBeenCalledWith('Panoya kopyalandı! 📋', 'info')
  })

})
