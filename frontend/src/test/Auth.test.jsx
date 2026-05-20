import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Auth from '../components/Auth.jsx'

// API modülü mock'lanıyor — gerçek HTTP isteği gönderilmesin
vi.mock('../services/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
}))

import { login } from '../services/api'

// Her testte kullanılacak varsayılan prop'lar
const defaultProps = {
  onAuth: vi.fn(),
  onGuestLogin: vi.fn(),
  darkMode: false,
  setDarkMode: vi.fn(),
  showToast: vi.fn(),
}

// Her testten önce mock'lar sıfırlanıyor
beforeEach(() => {
  vi.clearAllMocks()
})

describe('Auth — render', () => {

  it('varsayılan olarak giriş modu render edilmeli', () => {
    render(<Auth {...defaultProps} />)
    expect(screen.getByText('Hoş geldiniz 👋')).toBeInTheDocument()
    expect(screen.getByText('Hesabınıza giriş yapın')).toBeInTheDocument()
  })

  it('email ve şifre inputları render edilmeli', () => {
    render(<Auth {...defaultProps} />)
    expect(screen.getByPlaceholderText('ornek@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument()
  })

  it('misafir butonu render edilmeli', () => {
    render(<Auth {...defaultProps} />)
    expect(screen.getByText('👀 Misafir olarak devam et')).toBeInTheDocument()
  })

})

describe('Auth — tab geçişi', () => {

  it('Kayıt Ol tabına tıklayınca Şifre Tekrar inputu görünmeli', async () => {
    render(<Auth {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Kayıt Ol' }))
    // Kayıt modunda iki adet "••••••" placeholder'ı olmalı
    expect(screen.getAllByPlaceholderText('••••••')).toHaveLength(2)
  })

  it('Giriş Yap tabına geri dönünce Şifre Tekrar inputu kaybolmalı', async () => {
    render(<Auth {...defaultProps} />)
    // Önce kayıt moduna geç
    await userEvent.click(screen.getByRole('button', { name: 'Kayıt Ol' }))
    // Geri giriş moduna geç — ilk "Giriş Yap" butonu tab switcher'daki
    await userEvent.click(screen.getAllByRole('button', { name: /Giriş Yap/i })[0])
    // Tek şifre inputu kalmalı
    expect(screen.getAllByPlaceholderText('••••••')).toHaveLength(1)
  })

  it('tab değişince inputlar temizlenmeli', async () => {
    render(<Auth {...defaultProps} />)
    // Email inputuna yazı yaz
    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'test@example.com')
    // Kayıt moduna geç — inputlar sıfırlanmalı
    await userEvent.click(screen.getByRole('button', { name: 'Kayıt Ol' }))
    expect(screen.getByPlaceholderText('ornek@email.com')).toHaveValue('')
  })

})

describe('Auth — validasyon', () => {

  it('geçersiz email girilince hata mesajı gösterilmeli', async () => {
    render(<Auth {...defaultProps} />)
    // Kayıt moduna geç
    await userEvent.click(screen.getByRole('button', { name: 'Kayıt Ol' }))
    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'gecersiz-email')
    await userEvent.type(screen.getAllByPlaceholderText('••••••')[0], '123456')
    await userEvent.type(screen.getAllByPlaceholderText('••••••')[1], '123456')
    // Submit butonuna tıkla — kayıt modunda submit metni de "Kayıt Ol", son butonu seç
    const buttons = screen.getAllByRole('button', { name: 'Kayıt Ol' })
    await userEvent.click(buttons[buttons.length - 1])
    expect(screen.getByText('Geçerli bir email adresi girin')).toBeInTheDocument()
  })

  it('6 karakterden kısa şifre girilince hata mesajı gösterilmeli', async () => {
    render(<Auth {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Kayıt Ol' }))
    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'test@example.com')
    await userEvent.type(screen.getAllByPlaceholderText('••••••')[0], '123')
    await userEvent.type(screen.getAllByPlaceholderText('••••••')[1], '123')
    const buttons = screen.getAllByRole('button', { name: 'Kayıt Ol' })
    await userEvent.click(buttons[buttons.length - 1])
    expect(screen.getByText('Şifre en az 6 karakter olmalı')).toBeInTheDocument()
  })

  it('şifreler eşleşmeyince hata mesajı gösterilmeli', async () => {
    render(<Auth {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Kayıt Ol' }))
    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'test@example.com')
    await userEvent.type(screen.getAllByPlaceholderText('••••••')[0], '123456')
    await userEvent.type(screen.getAllByPlaceholderText('••••••')[1], '654321')
    const buttons = screen.getAllByRole('button', { name: 'Kayıt Ol' })
    await userEvent.click(buttons[buttons.length - 1])
    expect(screen.getByText('Şifreler eşleşmiyor')).toBeInTheDocument()
  })

})

describe('Auth — misafir girişi', () => {

  it('misafir butonuna tıklayınca onGuestLogin çağrılmalı', async () => {
    render(<Auth {...defaultProps} />)
    await userEvent.click(screen.getByText('👀 Misafir olarak devam et'))
    expect(defaultProps.onGuestLogin).toHaveBeenCalledTimes(1)
  })

})

describe('Auth — başarılı giriş', () => {

  it('başarılı girişte onAuth kullanıcıyla çağrılmalı', async () => {
    // Arrange — login başarılı yanıt dönecek şekilde ayarlanıyor
    const fakeUser = { _id: '123', email: 'test@example.com' }
    login.mockResolvedValue({ token: 'fake-token', user: fakeUser })

    render(<Auth {...defaultProps} />)
    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('••••••'), '123456')

    // Submit butonu — "Giriş Yap" metni birden fazla yerde geçtiği için son butonu seçiyoruz
    const submitBtn = screen.getAllByRole('button', { name: /Giriş Yap/i }).at(-1)
    await userEvent.click(submitBtn)

    // Assert — onAuth doğru kullanıcıyla çağrılmalı
    expect(defaultProps.onAuth).toHaveBeenCalledWith(fakeUser)
  })

  it('başarılı girişte showToast başarı mesajıyla çağrılmalı', async () => {
    const fakeUser = { _id: '123', email: 'test@example.com' }
    login.mockResolvedValue({ token: 'fake-token', user: fakeUser })

    render(<Auth {...defaultProps} />)
    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('••••••'), '123456')

    const submitBtn = screen.getAllByRole('button', { name: /Giriş Yap/i }).at(-1)
    await userEvent.click(submitBtn)

    expect(defaultProps.showToast).toHaveBeenCalledWith('Hoş geldiniz! 👋', 'success')
  })

  it('giriş başarısız olunca hata mesajı ekranda görünmeli', async () => {
    // Arrange — login hata fırlatacak şekilde ayarlanıyor
    login.mockRejectedValue(new Error('Email veya şifre hatalı'))

    render(<Auth {...defaultProps} />)
    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('••••••'), '123456')

    const submitBtn = screen.getAllByRole('button', { name: /Giriş Yap/i }).at(-1)
    await userEvent.click(submitBtn)

    // Assert — hata mesajı render edilmeli
    expect(await screen.findByText('Email veya şifre hatalı')).toBeInTheDocument()
  })

})
