import { useState } from 'react';
import { LightningIcon, FileTextIcon, GitDiffIcon, EyeIcon, EyeClosedIcon, SunDimIcon, MoonIcon } from '@phosphor-icons/react';
import { register, login } from '../services/api';

export default function Auth({ onAuth, onGuestLogin, darkMode, setDarkMode, showToast }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthTabChange = (tab) => {
    setMode(tab);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (mode === 'register') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) { setError('Geçerli bir email adresi girin'); return; }
      if (password.length < 6) { setError('Şifre en az 6 karakter olmalı'); return; }
      if (password !== confirmPassword) { setError('Şifreler eşleşmiyor'); return; }
    }
    setLoading(true);
    try {
      const fn = mode === 'login' ? login : register;
      const data = await fn(email, password);
      sessionStorage.setItem('token', data.token);
      showToast(mode === 'login' ? 'Hoş geldiniz! 👋' : 'Hesabınız oluşturuldu, hoş geldiniz! 🎉', 'success');
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#FFFBF5] dark:bg-[#0a0a0a] flex${darkMode ? ' dark' : ''}`}>
      <div className="hidden md:flex md:w-1/2 bg-[#FFF7ED] dark:bg-zinc-900 flex-col items-center justify-center pt-0 pb-16 px-12 border-r border-orange-100 dark:border-zinc-800">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-full.svg" alt="Promptune" className="w-60 h-auto" />
        </div>
        <img src="/illustration.svg" alt="illustration" className="w-full max-w-xs mb-8" />
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <div className="flex items-center gap-3 text-stone-500 dark:text-zinc-400 text-sm">
            <LightningIcon size={18} className="text-orange-500 shrink-0" weight="regular" />
            <span>Prompt'larınızı anında optimize edin</span>
          </div>
          <div className="flex items-center gap-3 text-stone-500 dark:text-zinc-400 text-sm">
            <FileTextIcon size={18} className="text-orange-400 shrink-0" weight="regular" />
            <span>Uzun sohbetleri özetleyin</span>
          </div>
          <div className="flex items-center gap-3 text-stone-500 dark:text-zinc-400 text-sm">
            <GitDiffIcon size={18} className="text-orange-300 shrink-0" weight="regular" />
            <span>Modelleri maliyet ve özellikle karşılaştırın</span>
          </div>
        </div>
      </div>

      <main className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#FFFBF5] dark:bg-[#0a0a0a]">
        <div className="w-full max-w-sm">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Açık temaya geç' : 'Koyu temaya geç'}
              className="p-2 rounded-lg transition-all cursor-pointer hover:scale-110 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {darkMode ? <SunDimIcon size={18} weight="regular" /> : <MoonIcon size={18} weight="regular" />}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-3 mb-8">
            <img src="/logo.svg" alt="Promptune" className="w-14 h-14" />
            <div>
              <p className="text-lg font-bold text-stone-900 dark:text-white leading-tight">
                prompt<span className="text-orange-700">une</span>
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">
            {mode === 'login' ? 'Hoş geldiniz 👋' : 'Hesap oluştur'}
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 text-sm mb-8">
            {mode === 'login' ? 'Hesabınıza giriş yapın' : 'Birkaç saniyede başlayın'}
          </p>

          <div className="flex bg-orange-50 dark:bg-zinc-800 rounded-xl p-1 mb-6 border border-orange-100 dark:border-zinc-700">
            <button
              onClick={() => handleAuthTabChange('login')}
              className={`cursor-pointer flex-1 px-4 py-2 text-sm font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] rounded-lg ${
                mode === 'login' ? 'bg-white dark:bg-zinc-700 text-orange-700 shadow-sm' : 'text-stone-400 dark:text-zinc-500'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => handleAuthTabChange('register')}
              className={`cursor-pointer flex-1 px-4 py-2 text-sm font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] rounded-lg ${
                mode === 'register' ? 'bg-white dark:bg-zinc-700 text-orange-700 shadow-sm' : 'text-stone-400 dark:text-zinc-500'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          <form>
            <label className={`text-xs font-medium mb-1.5 block transition-colors ${focusedInput === 'email' ? 'text-orange-700' : 'text-stone-600 dark:text-zinc-400'}`}>
              E-posta
            </label>
            <input
              type="text"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-stone-900 dark:text-white text-sm placeholder-stone-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/10 transition-all mb-4"
            />

            <label className={`text-xs font-medium mb-1.5 block transition-colors ${focusedInput === 'password' ? 'text-orange-700' : 'text-stone-600 dark:text-zinc-400'}`}>
              Şifre
            </label>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-3 pr-10 text-stone-900 dark:text-white text-sm placeholder-stone-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 cursor-pointer transition-colors flex items-center justify-center w-6 h-6"
              >
                {showPassword ? <EyeClosedIcon size={24} weight="regular" /> : <EyeIcon size={24} weight="regular" />}
              </button>
            </div>

            {mode === 'register' && (
              <>
                <label className={`text-xs font-medium mb-1.5 block transition-colors ${focusedInput === 'confirm' ? 'text-orange-700' : 'text-stone-600 dark:text-zinc-400'}`}>
                  Şifre Tekrar
                </label>
                <input
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedInput('confirm')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-stone-900 dark:text-white text-sm placeholder-stone-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/10 transition-all mb-4"
                />
              </>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="cursor-pointer w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-xl transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Lütfen bekleyin...' : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FFFBF5] dark:bg-[#0a0a0a] px-3 text-xs text-stone-400 dark:text-zinc-600">veya</span>
            </div>
          </div>

          <button
            onClick={() => onGuestLogin()}
            className="w-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-600 dark:text-zinc-400 font-medium py-3 rounded-xl transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] border border-stone-200 dark:border-zinc-700"
          >
            👀 Misafir olarak devam et
          </button>

          <div className="mt-5 text-center">
            {mode === 'login' ? (
              <>
                <span className="text-stone-600 dark:text-zinc-400 text-xs">Hesabın yok mu?</span>
                <button
                  onClick={() => handleAuthTabChange('register')}
                  className="cursor-pointer text-orange-700 hover:text-orange-700 text-xs ml-1 transition-colors"
                >
                  Kayıt ol
                </button>
              </>
            ) : (
              <>
                <span className="text-stone-600 dark:text-zinc-400 text-xs">Zaten hesabın var mı?</span>
                <button
                  onClick={() => handleAuthTabChange('login')}
                  className="cursor-pointer text-orange-700 hover:text-orange-700 text-xs ml-1 transition-colors"
                >
                  Giriş yap
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
