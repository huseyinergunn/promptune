import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import History from '../components/tabs/History.jsx'

vi.mock('../services/api', () => ({
  getHistory:    vi.fn(),
  deleteHistory: vi.fn(),
}))

vi.mock('recharts', () => ({
  AreaChart:         ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area:              () => null,
  XAxis:             () => null,
  YAxis:             () => null,
  CartesianGrid:     () => null,
  Tooltip:           () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}))

import { getHistory, deleteHistory } from '../services/api'

const defaultProps = {
  showToast:       vi.fn(),
  history:         [],
  setHistory:      vi.fn(),
  setStats:        vi.fn(),
  handleTabChange: vi.fn(),
  setPrompt:       vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('History — render', () => {

  it('başlık görünmeli', async () => {
    getHistory.mockResolvedValue({ history: [] })
    render(<History {...defaultProps} />)
    expect(screen.getByText('Geçmiş')).toBeInTheDocument()
  })

  it('boş geçmişte "Henüz optimizasyon geçmişi yok" göstermeli', async () => {
    getHistory.mockResolvedValue({ history: [] })
    render(<History {...defaultProps} history={[]} />)
    await waitFor(() => {
      expect(screen.getByText('Henüz optimizasyon geçmişi yok')).toBeInTheDocument()
    })
  })

  it('boş geçmişte "Prompt Optimize\'a git" butonu görünmeli', async () => {
    getHistory.mockResolvedValue({ history: [] })
    render(<History {...defaultProps} history={[]} />)
    await waitFor(() => {
      expect(screen.getByText("Prompt Optimize'a git →")).toBeInTheDocument()
    })
  })

  it('"Prompt Optimize\'a git" butonuna tıklanınca handleTabChange çağrılmalı', async () => {
    getHistory.mockResolvedValue({ history: [] })
    render(<History {...defaultProps} history={[]} />)
    await waitFor(() => screen.getByText("Prompt Optimize'a git →"))
    await userEvent.click(screen.getByText("Prompt Optimize'a git →"))
    expect(defaultProps.handleTabChange).toHaveBeenCalledWith('optimize')
  })

})

describe('History — geçmiş verisi', () => {

  const mockHistory = [
    {
      _id: '1',
      originalPrompt: 'Test promptu buraya yaz',
      optimizedPrompt: 'Kısa prompt',
      originalTokenCount: 20,
      optimizedTokenCount: 10,
      percentage: 50,
      savedTokens: 10,
      createdAt: '2024-01-15T10:30:00.000Z',
    },
    {
      _id: '2',
      originalPrompt: 'İkinci test promptu',
      optimizedPrompt: 'İkinci kısa',
      originalTokenCount: 15,
      optimizedTokenCount: 8,
      percentage: 47,
      savedTokens: 7,
      createdAt: '2024-01-16T11:00:00.000Z',
    },
  ]

  it('geçmiş kartları görünmeli', async () => {
    getHistory.mockResolvedValue({ history: mockHistory })
    render(<History {...defaultProps} history={mockHistory} />)
    await waitFor(() => expect(screen.getByText(/Test promptu/)).toBeInTheDocument())
  })

  it('tasarruf yüzdesi görünmeli', async () => {
    getHistory.mockResolvedValue({ history: mockHistory })
    render(<History {...defaultProps} history={mockHistory} />)
    await waitFor(() => expect(screen.getByText('%50 tasarruf')).toBeInTheDocument())
  })

  it('birden fazla geçmiş varsa "Geçmişi Temizle" butonu görünmeli', async () => {
    getHistory.mockResolvedValue({ history: mockHistory })
    render(<History {...defaultProps} history={mockHistory} />)
    await waitFor(() => expect(screen.getByText('Geçmişi Temizle')).toBeInTheDocument())
  })

  it('geçmiş kartına tıklayınca setPrompt ve handleTabChange çağrılmalı', async () => {
    getHistory.mockResolvedValue({ history: mockHistory })
    render(<History {...defaultProps} history={mockHistory} />)
    const card = await waitFor(() =>
      screen.getByText(/Test promptu/).closest('div[class*="cursor-pointer"]')
    )
    await userEvent.click(card)
    expect(defaultProps.setPrompt).toHaveBeenCalledWith('Test promptu buraya yaz')
    expect(defaultProps.handleTabChange).toHaveBeenCalledWith('optimize')
  })

  it('2+ geçmişte grafik render edilmeli', async () => {
    getHistory.mockResolvedValue({ history: mockHistory })
    render(<History {...defaultProps} history={mockHistory} />)
    await waitFor(() => expect(screen.getByTestId('area-chart')).toBeInTheDocument())
  })

})

describe('History — geçmiş silme', () => {

  it('"Geçmişi Temizle" butonuna tıklayınca deleteHistory çağrılmalı', async () => {
    deleteHistory.mockResolvedValue({})
    getHistory.mockResolvedValue({ history: [{ _id: '1', originalPrompt: 'P', optimizedPrompt: 'O', originalTokenCount: 5, optimizedTokenCount: 3, percentage: 40, savedTokens: 2, createdAt: '2024-01-15T10:00:00.000Z' }] })
    const oneItem = [{ _id: '1', originalPrompt: 'Kısa prompt', optimizedPrompt: 'Kısa', originalTokenCount: 5, optimizedTokenCount: 3, percentage: 40, savedTokens: 2, createdAt: '2024-01-15T10:00:00.000Z' }]
    render(<History {...defaultProps} history={oneItem} />)
    await userEvent.click(screen.getByText('Geçmişi Temizle'))
    expect(deleteHistory).toHaveBeenCalled()
    expect(defaultProps.setHistory).toHaveBeenCalledWith([])
  })

  it('silme başarılı olunca showToast çağrılmalı', async () => {
    deleteHistory.mockResolvedValue({})
    const oneItem = [{ _id: '1', originalPrompt: 'Kısa prompt', optimizedPrompt: 'Kısa', originalTokenCount: 5, optimizedTokenCount: 3, percentage: 40, savedTokens: 2, createdAt: '2024-01-15T10:00:00.000Z' }]
    render(<History {...defaultProps} history={oneItem} />)
    await userEvent.click(screen.getByText('Geçmişi Temizle'))
    await waitFor(() => {
      expect(defaultProps.showToast).toHaveBeenCalledWith('Geçmişiniz temizlendi.', 'info')
    })
  })

})

describe('History — useEffect ile veri çekme', () => {

  it('mount olunca getHistory çağrılmalı', async () => {
    getHistory.mockResolvedValue({ history: [] })
    render(<History {...defaultProps} />)
    await waitFor(() => {
      expect(getHistory).toHaveBeenCalled()
    })
  })

  it('hata durumunda setHistory([]) çağrılmalı', async () => {
    getHistory.mockRejectedValue(new Error('Ağ hatası'))
    render(<History {...defaultProps} />)
    await waitFor(() => {
      expect(defaultProps.setHistory).toHaveBeenCalledWith([])
    })
  })

})
