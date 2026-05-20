import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from '../components/tabs/Dashboard.jsx'

const defaultProps = {
  user:            { email: 'test@example.com' },
  isGuest:         false,
  stats:           null,
  handleTabChange: vi.fn(),
  setUser:         vi.fn(),
  setIsGuest:      vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Dashboard — render', () => {

  it('giriş yapmış kullanıcıya email bazlı selamlama göstermeli', () => {
    render(<Dashboard {...defaultProps} />)
    expect(screen.getByText(/Hoş geldiniz, test! 👋/)).toBeInTheDocument()
  })

  it('alt başlık görünmeli', () => {
    render(<Dashboard {...defaultProps} />)
    expect(screen.getByText('Yapay zeka maliyetlerinizi optimize edin')).toBeInTheDocument()
  })

  it('sekme kartları görünmeli', () => {
    render(<Dashboard {...defaultProps} />)
    expect(screen.getByText('Prompt Optimize')).toBeInTheDocument()
    expect(screen.getByText('Chat Özetle')).toBeInTheDocument()
    expect(screen.getByText('Model Karşılaştır')).toBeInTheDocument()
  })

  it('ipucu kutusu görünmeli', () => {
    render(<Dashboard {...defaultProps} />)
    expect(screen.getByText('İPUCU')).toBeInTheDocument()
  })

})

describe('Dashboard — misafir modu', () => {

  it('misafir kullanıcıya banner göstermeli', () => {
    render(<Dashboard {...defaultProps} isGuest={true} user={{ isGuest: true }} />)
    expect(screen.getByText('Misafir olarak kullanıyorsunuz')).toBeInTheDocument()
  })

  it('misafir bannerındaki "Giriş Yap" butonuna tıklayınca setUser ve setIsGuest çağrılmalı', async () => {
    render(<Dashboard {...defaultProps} isGuest={true} user={{ isGuest: true }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Giriş Yap' }))
    expect(defaultProps.setUser).toHaveBeenCalledWith(null)
    expect(defaultProps.setIsGuest).toHaveBeenCalledWith(false)
  })

})

describe('Dashboard — istatistikler', () => {

  it('stats varken optimizasyon sayısı görünmeli', () => {
    render(<Dashboard {...defaultProps} stats={{ totalOptimizations: 42, totalSavedTokens: 1000, avgPercentage: 35 }} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('stats varken token tasarrufu görünmeli', () => {
    render(<Dashboard {...defaultProps} stats={{ totalOptimizations: 0, totalSavedTokens: 5000, avgPercentage: 0 }} />)
    expect(screen.getByText(/5[,.]000/)).toBeInTheDocument()
  })

  it('totalSavedTokens 0 ise "-" göstermeli', () => {
    render(<Dashboard {...defaultProps} stats={{ totalOptimizations: 0, totalSavedTokens: 0, avgPercentage: 0 }} />)
    expect(screen.getAllByText('-').length).toBeGreaterThan(0)
  })

  it('avgPercentage > 0 ise yüzde göstermeli', () => {
    render(<Dashboard {...defaultProps} stats={{ totalOptimizations: 5, totalSavedTokens: 100, avgPercentage: 38 }} />)
    expect(screen.getByText('%38')).toBeInTheDocument()
  })

})

describe('Dashboard — sekme navigasyonu', () => {

  it('sekme kartına tıklayınca handleTabChange doğru id ile çağrılmalı', async () => {
    render(<Dashboard {...defaultProps} />)
    await userEvent.click(screen.getByText('Prompt Optimize'))
    expect(defaultProps.handleTabChange).toHaveBeenCalledWith('optimize')
  })

  it('Dashboard kartı sekme listesinde olmamalı', () => {
    render(<Dashboard {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    const labels = buttons.map(b => b.textContent)
    expect(labels.some(l => l?.includes('Dashboard'))).toBe(false)
  })

})
