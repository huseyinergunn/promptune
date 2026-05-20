import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../components/Sidebar.jsx'

const defaultProps = {
  activeTab:        'dashboard',
  handleTabChange:  vi.fn(),
  user:             { email: 'user@example.com' },
  isGuest:          false,
  onLogout:         vi.fn(),
  toggleDarkMode:   vi.fn(),
  darkMode:         false,
  mobileMenuOpen:   false,
  setMobileMenuOpen: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('Sidebar — masaüstü nav', () => {

  it('tüm sekme etiketleri render edilmeli', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Prompt Optimize').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Geçmiş').length).toBeGreaterThan(0)
  })

  it('sekmeye tıklayınca handleTabChange çağrılmalı', async () => {
    render(<Sidebar {...defaultProps} />)
    const buttons = screen.getAllByText('Prompt Optimize')
    await userEvent.click(buttons[0])
    expect(defaultProps.handleTabChange).toHaveBeenCalledWith('optimize')
  })

  it('koyu mod kapalıyken dark mode butonu görünmeli', () => {
    render(<Sidebar {...defaultProps} darkMode={false} />)
    expect(screen.getAllByText('Koyu Mod').length).toBeGreaterThan(0)
  })

  it('koyu mod açıkken açık mod butonu görünmeli', () => {
    render(<Sidebar {...defaultProps} darkMode={true} />)
    expect(screen.getAllByText('Açık Mod').length).toBeGreaterThan(0)
  })

  it('dark mode butonuna tıklanınca toggleDarkMode çağrılmalı', async () => {
    render(<Sidebar {...defaultProps} />)
    const darkBtns = screen.getAllByText('Koyu Mod')
    await userEvent.click(darkBtns[0])
    expect(defaultProps.toggleDarkMode).toHaveBeenCalled()
  })

  it('çıkış butonuna tıklanınca onLogout çağrılmalı', async () => {
    render(<Sidebar {...defaultProps} />)
    const exitBtns = screen.getAllByText('Çıkış')
    await userEvent.click(exitBtns[0])
    expect(defaultProps.onLogout).toHaveBeenCalled()
  })

  it('misafir kullanıcıda çıkış butonu "Giriş Yap" göstermeli', () => {
    render(<Sidebar {...defaultProps} isGuest={true} user={{ isGuest: true }} />)
    expect(screen.getAllByText('Giriş Yap').length).toBeGreaterThan(0)
  })

  it('misafir değilse kullanıcı emaili göstermeli', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0)
  })

})

describe('Sidebar — mobil menü', () => {

  it('mobileMenuOpen false iken mobil panel görünmemeli', () => {
    render(<Sidebar {...defaultProps} mobileMenuOpen={false} />)
    expect(screen.queryByAltText('Promptune')).not.toBeInTheDocument()
  })

  it('mobileMenuOpen true iken mobil panel görünmeli', () => {
    render(<Sidebar {...defaultProps} mobileMenuOpen={true} />)
    expect(screen.getByAltText('Promptune')).toBeInTheDocument()
  })

  it('mobil arka plana tıklayınca setMobileMenuOpen(false) çağrılmalı', async () => {
    render(<Sidebar {...defaultProps} mobileMenuOpen={true} />)
    const backdrop = document.querySelector('.md\\:hidden.fixed.inset-0')
    await userEvent.click(backdrop)
    expect(defaultProps.setMobileMenuOpen).toHaveBeenCalledWith(false)
  })

  it('mobil menüde sekmeye tıklayınca handleTabChange ve setMobileMenuOpen çağrılmalı', async () => {
    render(<Sidebar {...defaultProps} mobileMenuOpen={true} />)
    // Mobile panel has 'Chat Özetle' inside the mobile div
    const summarizeLinks = screen.getAllByText('Chat Özetle')
    await userEvent.click(summarizeLinks[0])
    expect(defaultProps.handleTabChange).toHaveBeenCalledWith('summarize')
    expect(defaultProps.setMobileMenuOpen).toHaveBeenCalledWith(false)
  })

})
