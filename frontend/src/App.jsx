import { useState, useEffect, lazy, Suspense } from 'react';
import { getMe, getHistory, getStats } from './services/api';
import Toast from './components/Toast.jsx';
import Auth from './components/Auth.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';

const Dashboard  = lazy(() => import('./components/tabs/Dashboard.jsx'));
const Optimize   = lazy(() => import('./components/tabs/Optimize.jsx'));
const Summarize  = lazy(() => import('./components/tabs/Summarize.jsx'));
const Calculator = lazy(() => import('./components/tabs/Calculator.jsx'));
const Compare    = lazy(() => import('./components/tabs/Compare.jsx'));
const Vision     = lazy(() => import('./components/tabs/Vision.jsx'));
const History    = lazy(() => import('./components/tabs/History.jsx'));

function App() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authChecking, setAuthChecking] = useState(() => !!sessionStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('activeTab') || 'dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [darkMode, setDarkMode] = useState(() => sessionStorage.getItem('darkMode') === 'true');
  const [prompt, setPrompt] = useState(() => sessionStorage.getItem('savedPrompt') || '');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    showToast(next ? 'Koyu tema aktif 🌙' : 'Açık tema aktif ☀️', 'info');
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      sessionStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      sessionStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    getMe()
      .then((data) => setUser(data.user))
      .catch(() => sessionStorage.removeItem('token'))
      .finally(() => setAuthChecking(false));
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    getStats().then(setStats).catch(() => {});
    getHistory().then(data => setHistory(data.history)).catch(() => {});
  }, []);

  useEffect(() => {
    sessionStorage.setItem('savedPrompt', prompt);
  }, [prompt]);

  const handleGuestLogin = () => {
    setIsGuest(true);
    setUser({ email: 'misafir', isGuest: true });
    showToast('Misafir olarak devam ediyorsunuz. Geçmişiniz kaydedilmeyecek.', 'info');
  };

  const handleLogout = () => {
    showToast('Başarıyla çıkış yapıldı. Görüşürüz! 👋', 'info');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('savedPrompt');
    sessionStorage.removeItem('savedChatInput');
    sessionStorage.removeItem('savedCompareInput');
    sessionStorage.removeItem('activeTab');
    setIsGuest(false);
    setPrompt('');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab) => {
    if (isGuest && (tab === 'vision' || tab === 'history')) {
      showToast('Bu özellik için giriş yapmanız gerekiyor 🔐', 'error');
      return;
    }
    setActiveTab(tab);
    sessionStorage.setItem('activeTab', tab);
    if (tab !== 'optimize') {
      setPrompt('');
    }
    if (tab === 'dashboard') {
      getHistory().then(data => setHistory(data.history)).catch(() => {});
      getStats().then(setStats).catch(() => {});
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <span className="text-stone-400 text-sm">Yükleniyor...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <Auth onAuth={(u) => setUser(u)} onGuestLogin={handleGuestLogin} darkMode={darkMode} setDarkMode={toggleDarkMode} showToast={showToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5]/60 dark:bg-[#0a0a0a]/80 flex flex-col">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="blob-orange" />
      <div className="blob-yellow" />
      <div className="blob-purple" />

      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        activeTab={activeTab}
        mobileMenuOpen={mobileMenuOpen}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        handleTabChange={handleTabChange}
      />

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          user={user}
          isGuest={isGuest}
          onLogout={handleLogout}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className={`flex-1 ${activeTab === 'dashboard' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className="max-w-2xl mx-auto w-full px-6 py-8">
            <Suspense fallback={<div className="flex items-center justify-center py-20"><span className="text-stone-400 text-sm">Yükleniyor...</span></div>}>
              {activeTab === 'dashboard' && (
                <Dashboard
                  user={user}
                  isGuest={isGuest}
                  stats={stats}
                  handleTabChange={handleTabChange}
                  setUser={setUser}
                  setIsGuest={setIsGuest}
                />
              )}
              {activeTab === 'optimize' && (
                <Optimize
                  showToast={showToast}
                  setHistory={setHistory}
                  setStats={setStats}
                  prompt={prompt}
                  setPrompt={setPrompt}
                />
              )}
              {activeTab === 'summarize' && (
                <Summarize showToast={showToast} />
              )}
              {activeTab === 'calculator' && (
                <Calculator />
              )}
              {activeTab === 'compare' && (
                <Compare showToast={showToast} />
              )}
              {activeTab === 'vision' && (
                <Vision showToast={showToast} />
              )}
              {activeTab === 'history' && (
                <History
                  showToast={showToast}
                  history={history}
                  setHistory={setHistory}
                  setStats={setStats}
                  handleTabChange={handleTabChange}
                  setPrompt={setPrompt}
                />
              )}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
