import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Summarize from '../components/tabs/Summarize.jsx'

vi.mock('../services/api', () => ({
  summarizeChat: vi.fn(),
}))

import { summarizeChat } from '../services/api'

const defaultProps = {
  showToast: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

describe('Summarize — render', () => {

  it('başlık ve alt başlık görünmeli', () => {
    render(<Summarize {...defaultProps} />)
    expect(screen.getByText('Chat Özetle')).toBeInTheDocument()
    expect(screen.getByText('Uzun konuşmaları kısa özete dönüştürün')).toBeInTheDocument()
  })

  it('textarea render edilmeli', () => {
    render(<Summarize {...defaultProps} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('token sayacı etiketi görünmeli', () => {
    render(<Summarize {...defaultProps} />)
    expect(screen.getByText(/~0 token · 0 karakter/)).toBeInTheDocument()
  })

  it('Özetle butonu render edilmeli', () => {
    render(<Summarize {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Özetle' })).toBeInTheDocument()
  })

  it('başlangıçta EmptyState görünmeli', () => {
    render(<Summarize {...defaultProps} />)
    expect(screen.getByText('Mesajlarınızı JSON formatında girin')).toBeInTheDocument()
    expect(screen.getByText('En az 4 mesaj gereklidir')).toBeInTheDocument()
  })

})

describe('Summarize — Özetle butonu', () => {

  it('textarea boşken disabled olmalı', () => {
    render(<Summarize {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Özetle' })).toBeDisabled()
  })

  it('textarea dolunca enabled olmalı', () => {
    render(<Summarize {...defaultProps} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'metin' } })
    expect(screen.getByRole('button', { name: 'Özetle' })).toBeEnabled()
  })

})

describe('Summarize — hata durumları', () => {

  it('geçersiz JSON girilince hata kutusu gösterilmeli', async () => {
    render(<Summarize {...defaultProps} />)
    await userEvent.type(screen.getByRole('textbox'), 'gecersiz json')
    await userEvent.click(screen.getByRole('button', { name: 'Özetle' }))
    expect(await screen.findByText('Geçersiz JSON formatı')).toBeInTheDocument()
  })

  it('geçersiz JSON girilince showToast hata mesajıyla çağrılmalı', async () => {
    render(<Summarize {...defaultProps} />)
    await userEvent.type(screen.getByRole('textbox'), 'gecersiz json')
    await userEvent.click(screen.getByRole('button', { name: 'Özetle' }))
    await screen.findByText('Geçersiz JSON formatı')
    expect(defaultProps.showToast).toHaveBeenCalledWith('Geçersiz JSON formatı', 'error')
  })

})

describe('Summarize — başarılı özet', () => {

  const validInput = '[{"role":"user","content":"Merhaba"}]'
  const fakeResult = {
    summary: 'Kullanıcı selamlama yapmış.',
    savings: { percentage: 60, tokens: 120 },
    originalMessages: 4,
  }

  it('Özetle tıklanınca EmptyState kaybolmalı', async () => {
    summarizeChat.mockResolvedValue(fakeResult)
    render(<Summarize {...defaultProps} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: validInput } })
    await userEvent.click(screen.getByRole('button', { name: 'Özetle' }))
    expect(await screen.findByText('Kullanıcı selamlama yapmış.')).toBeInTheDocument()
    expect(screen.queryByText('Mesajlarınızı JSON formatında girin')).not.toBeInTheDocument()
  })

  it('özet metni render edilmeli', async () => {
    summarizeChat.mockResolvedValue(fakeResult)
    render(<Summarize {...defaultProps} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: validInput } })
    await userEvent.click(screen.getByRole('button', { name: 'Özetle' }))
    expect(await screen.findByText('Kullanıcı selamlama yapmış.')).toBeInTheDocument()
  })

  it('tasarruf yüzdesi render edilmeli', async () => {
    summarizeChat.mockResolvedValue(fakeResult)
    render(<Summarize {...defaultProps} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: validInput } })
    await userEvent.click(screen.getByRole('button', { name: 'Özetle' }))
    expect(await screen.findByText('%60')).toBeInTheDocument()
  })

  it('token kazanımı ve mesaj sayısı render edilmeli', async () => {
    summarizeChat.mockResolvedValue(fakeResult)
    render(<Summarize {...defaultProps} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: validInput } })
    await userEvent.click(screen.getByRole('button', { name: 'Özetle' }))
    await screen.findByText('Kullanıcı selamlama yapmış.')
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('showToast başarı mesajıyla çağrılmalı', async () => {
    summarizeChat.mockResolvedValue(fakeResult)
    render(<Summarize {...defaultProps} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: validInput } })
    await userEvent.click(screen.getByRole('button', { name: 'Özetle' }))
    await screen.findByText('Kullanıcı selamlama yapmış.')
    expect(defaultProps.showToast).toHaveBeenCalledWith('Konuşma başarıyla özetlendi!', 'success')
  })

})
