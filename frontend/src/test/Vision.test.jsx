import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Vision from '../components/tabs/Vision.jsx'

vi.mock('../services/api', () => ({
  analyzeImage: vi.fn(),
}))

import { analyzeImage } from '../services/api'

const showToast = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
})

describe('Vision — render', () => {

  it('başlık görünmeli', () => {
    render(<Vision showToast={showToast} />)
    expect(screen.getByText('Görsel Analiz')).toBeInTheDocument()
  })

  it('görsel yükleme alanı görünmeli', () => {
    render(<Vision showToast={showToast} />)
    expect(screen.getByText('Görsel yükleyin')).toBeInTheDocument()
  })

  it('analiz butonu başlangıçta disabled olmalı', () => {
    render(<Vision showToast={showToast} />)
    expect(screen.getByRole('button', { name: 'Analiz Et' })).toBeDisabled()
  })

  it('EmptyState görünmeli', () => {
    render(<Vision showToast={showToast} />)
    expect(screen.getByText('PNG, JPG, WEBP desteklenir — max 5MB')).toBeInTheDocument()
  })

})

describe('Vision — dosya seçimi', () => {

  it('dosya seçilince önizleme göstermeli', async () => {
    render(<Vision showToast={showToast} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['img'], 'test.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })
  })

  it('dosya seçilince analiz butonu aktif olmalı', async () => {
    render(<Vision showToast={showToast} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['img'], 'test.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Analiz Et' })).not.toBeDisabled()
    })
  })

})

describe('Vision — analiz', () => {

  const mockResult = {
    extractedText: 'Test metin',
    originalTokenCount: 10,
    optimized: { prompt: 'Kısa metin', tokenCount: 5 },
    savings: { percentage: 50, tokens: 5 },
  }

  it('başarılı analizde sonuç görünmeli', async () => {
    analyzeImage.mockResolvedValue(mockResult)
    render(<Vision showToast={showToast} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['img'], 'test.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    await userEvent.click(screen.getByRole('button', { name: 'Analiz Et' }))
    await waitFor(() => {
      expect(screen.getByText('Test metin')).toBeInTheDocument()
    })
    expect(showToast).toHaveBeenCalledWith('Görsel başarıyla analiz edildi!', 'success')
  })

  it('başarılı analizde tasarruf yüzdesi görünmeli', async () => {
    analyzeImage.mockResolvedValue(mockResult)
    render(<Vision showToast={showToast} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['img'], 'test.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    await userEvent.click(screen.getByRole('button', { name: 'Analiz Et' }))
    await waitFor(() => {
      expect(screen.getByText('%50')).toBeInTheDocument()
    })
  })

  it('hata durumunda hata mesajı göstermeli', async () => {
    analyzeImage.mockRejectedValue(new Error('Analiz başarısız'))
    render(<Vision showToast={showToast} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['img'], 'test.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    await userEvent.click(screen.getByRole('button', { name: 'Analiz Et' }))
    await waitFor(() => {
      expect(screen.getByText('Analiz başarısız')).toBeInTheDocument()
    })
    expect(showToast).toHaveBeenCalledWith('Analiz başarısız', 'error')
  })

})
