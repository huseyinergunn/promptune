import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from './server'
import Auth from '../components/Auth.jsx'

// vi.mock YOK — gerçek api.js çalışıyor, MSW ağı yakalıyor

const defaultProps = {
  onAuth: vi.fn(),
  onGuestLogin: vi.fn(),
  darkMode: false,
  setDarkMode: vi.fn(),
  showToast: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

describe('Auth MSW — başarılı giriş', () => {

  it('handlers.js\'deki sahte yanıtla onAuth çağrılmalı', async () => {
    render(<Auth {...defaultProps} />)

    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText('••••••'), '123456')

    // Butona tıklanınca api.js → fetch → MSW yakalar → sahte token döner
    await userEvent.click(screen.getAllByRole('button', { name: /Giriş Yap/i }).at(-1))

    // onAuth, MSW'nin döndürdüğü user objesiyle çağrılmalı
    expect(await screen.findByText('Hoş geldiniz 👋')).toBeInTheDocument()
    expect(defaultProps.onAuth).toHaveBeenCalledWith({
      id: 'kullanici-id-001',
      email: 'test@test.com',
    })
  })

  it('başarılı girişte token sessionStorage\'a kaydedilmeli', async () => {
    render(<Auth {...defaultProps} />)

    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText('••••••'), '123456')
    await userEvent.click(screen.getAllByRole('button', { name: /Giriş Yap/i }).at(-1))

    // api.js içindeki sessionStorage.setItem('token', ...) satırını test ediyoruz
    await screen.findByText('Hoş geldiniz 👋')
    expect(sessionStorage.getItem('token')).toBe('sahte-jwt-token-12345')
  })

})

describe('Auth MSW — sunucu hata döndürünce', () => {

  it('401 gelince hata mesajı ekranda görünmeli', async () => {
    // Bu test için handlers.js'i geçici olarak override ediyoruz
    // server.use() sadece bu test için geçerli — afterEach'de resetHandlers() sıfırlar
    server.use(
      http.post('https://promptune-api.onrender.com/api/auth/login', () => {
        return HttpResponse.json(
          { error: 'Email veya şifre hatalı' },
          { status: 401 }
        )
      })
    )

    render(<Auth {...defaultProps} />)

    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'yanlis@test.com')
    await userEvent.type(screen.getByPlaceholderText('••••••'), 'yanlis')
    await userEvent.click(screen.getAllByRole('button', { name: /Giriş Yap/i }).at(-1))

    // api.js res.ok false olunca throw eder, Auth bileşeni hata gösterir
    expect(await screen.findByText('Email veya şifre hatalı')).toBeInTheDocument()
  })

})

describe('Auth MSW — kayıt', () => {

  it('kayıt başarılı olunca onAuth çağrılmalı', async () => {
    render(<Auth {...defaultProps} />)

    // Tab switcher'daki "Kayıt Ol" butonu — index 0
    await userEvent.click(screen.getAllByRole('button', { name: 'Kayıt Ol' })[0])

    await userEvent.type(screen.getByPlaceholderText('ornek@email.com'), 'yeni@test.com')
    await userEvent.type(screen.getAllByPlaceholderText('••••••')[0], 'sifre123')
    await userEvent.type(screen.getAllByPlaceholderText('••••••')[1], 'sifre123')

    // Submit butonu — "Kayıt Ol" butonlarının sonuncusu
    await userEvent.click(screen.getAllByRole('button', { name: 'Kayıt Ol' }).at(-1))

    // handlers.js'deki /auth/register 201 döner, onAuth çağrılmalı
    expect(defaultProps.onAuth).toHaveBeenCalledWith({
      id: 'kullanici-id-002',
      email: 'yeni@test.com',
    })
  })

})
