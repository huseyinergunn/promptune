import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Calculator from '../components/tabs/Calculator.jsx'

describe('Calculator — render', () => {

  it('başlık ve alt başlık görünmeli', () => {
    render(<Calculator />)
    expect(screen.getByText(/Token Hesaplayıcı/i)).toBeInTheDocument()
    expect(screen.getByText(/tahmini maliyet hesaplayın/i)).toBeInTheDocument()
  })

  it('3 input alanı render edilmeli', () => {
    render(<Calculator />)
    expect(screen.getByPlaceholderText('1000')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('500')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('1')).toBeInTheDocument()
  })

  it('Günlük İstek inputu varsayılan olarak 1 gelmeli', () => {
    render(<Calculator />)
    expect(screen.getByPlaceholderText('1')).toHaveValue(1)
  })

  it('tüm senaryo butonları render edilmeli', () => {
    render(<Calculator />)
    expect(screen.getByText('💬 Basit sohbet')).toBeInTheDocument()
    expect(screen.getByText('📝 İçerik üretimi')).toBeInTheDocument()
    expect(screen.getByText('💻 Kod asistanı')).toBeInTheDocument()
    expect(screen.getByText('📊 Veri analizi')).toBeInTheDocument()
    expect(screen.getByText('🔍 Prompt optimize')).toBeInTheDocument()
  })

  it('başlangıçta EmptyState görünmeli', () => {
    render(<Calculator />)
    expect(screen.getByText('Token sayılarını girin ve hesaplayın')).toBeInTheDocument()
  })

})

describe('Calculator — Hesapla butonu', () => {

  it('her iki input boşken disabled olmalı', () => {
    render(<Calculator />)
    expect(screen.getByRole('button', { name: /Hesapla/i })).toBeDisabled()
  })

  it('girdi inputu dolunca enabled olmalı', async () => {
    render(<Calculator />)
    await userEvent.type(screen.getByPlaceholderText('1000'), '500')
    expect(screen.getByRole('button', { name: /Hesapla/i })).toBeEnabled()
  })

  it('inputa değer girilince değer güncellenmeli', async () => {
    render(<Calculator />)
    const input = screen.getByPlaceholderText('1000')
    await userEvent.type(input, '4000')
    expect(input).toHaveValue(4000)
  })

})

describe('Calculator — senaryo butonları', () => {

  it('Basit sohbet butonuna tıklayınca girdi 500, çıktı 300 olmalı', async () => {
    render(<Calculator />)
    await userEvent.click(screen.getByText('💬 Basit sohbet'))
    expect(screen.getByPlaceholderText('1000')).toHaveValue(500)
    expect(screen.getByPlaceholderText('500')).toHaveValue(300)
  })

  it('Veri analizi butonuna tıklayınca girdi 2000, çıktı 1000 olmalı', async () => {
    render(<Calculator />)
    await userEvent.click(screen.getByText('📊 Veri analizi'))
    expect(screen.getByPlaceholderText('1000')).toHaveValue(2000)
    expect(screen.getByPlaceholderText('500')).toHaveValue(1000)
  })

})

describe('Calculator — hesaplama sonuçları', () => {

  it('Hesapla tıklanınca EmptyState kaybolmalı', async () => {
    render(<Calculator />)
    await userEvent.type(screen.getByPlaceholderText('1000'), '1000')
    await userEvent.click(screen.getByRole('button', { name: /Hesapla/i }))
    expect(screen.queryByText('Token sayılarını girin ve hesaplayın')).not.toBeInTheDocument()
  })

  it('Hesapla tıklanınca model listesi başlığı görünmeli', async () => {
    render(<Calculator />)
    await userEvent.type(screen.getByPlaceholderText('1000'), '1000')
    await userEvent.click(screen.getByRole('button', { name: /Hesapla/i }))
    expect(screen.getByText(/ucuzdan pahalıya/i)).toBeInTheDocument()
  })

  it('ilk sıradaki modelde "En Ucuz" rozeti olmalı', async () => {
    render(<Calculator />)
    await userEvent.type(screen.getByPlaceholderText('1000'), '1000')
    await userEvent.type(screen.getByPlaceholderText('500'), '500')
    await userEvent.click(screen.getByRole('button', { name: /Hesapla/i }))
    expect(screen.getByText('En Ucuz')).toBeInTheDocument()
  })

  it('"En Ucuz" rozeti yalnızca bir kez görünmeli', async () => {
    render(<Calculator />)
    await userEvent.type(screen.getByPlaceholderText('1000'), '1000')
    await userEvent.click(screen.getByRole('button', { name: /Hesapla/i }))
    expect(screen.getAllByText('En Ucuz')).toHaveLength(1)
  })

  it('tüm modeller için "per istek" etiketi render edilmeli', async () => {
    render(<Calculator />)
    await userEvent.type(screen.getByPlaceholderText('1000'), '1000')
    await userEvent.click(screen.getByRole('button', { name: /Hesapla/i }))
    // MODEL_PRICES dizisinde 7 model var
    expect(screen.getAllByText('per istek')).toHaveLength(7)
  })

})
