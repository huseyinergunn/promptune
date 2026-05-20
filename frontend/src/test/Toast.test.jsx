import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '../components/Toast.jsx'

describe('Toast — render', () => {

  it('toast null ise hiçbir şey render edilmemeli', () => {
    const { container } = render(<Toast toast={null} onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('success tipinde mesaj ve ✓ ikonu görünmeli', () => {
    render(<Toast toast={{ type: 'success', message: 'Başarılı!' }} onClose={vi.fn()} />)
    expect(screen.getByText('Başarılı!')).toBeInTheDocument()
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('error tipinde mesaj ve ✕ ikonu görünmeli', () => {
    render(<Toast toast={{ type: 'error', message: 'Hata oluştu' }} onClose={vi.fn()} />)
    expect(screen.getByText('Hata oluştu')).toBeInTheDocument()
    expect(screen.getAllByText('✕')[0]).toBeInTheDocument()
  })

  it('info tipinde mesaj ve ℹ ikonu görünmeli', () => {
    render(<Toast toast={{ type: 'info', message: 'Bilgi mesajı' }} onClose={vi.fn()} />)
    expect(screen.getByText('Bilgi mesajı')).toBeInTheDocument()
    expect(screen.getByText('ℹ')).toBeInTheDocument()
  })

})

describe('Toast — kapat butonu', () => {

  it('✕ butonuna tıklayınca onClose çağrılmalı', async () => {
    const onClose = vi.fn()
    render(<Toast toast={{ type: 'success', message: 'Test' }} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

})
