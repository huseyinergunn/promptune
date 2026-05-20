import { useState, useEffect } from 'react';
import { LightningIcon } from '@phosphor-icons/react';
import { optimizePrompt, getStats, getHistory } from '../../services/api';
import { LANGUAGES, TEMPLATES, TAB_HEADERS, btn, estimateTokens } from '../../constants.jsx';
import EmptyState from '../EmptyState.jsx';

function OptimizeSkeleton() {
  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 animate-pulse shadow-sm dark:shadow-none">
            <div className="w-16 h-3 bg-stone-100 dark:bg-zinc-800 rounded mb-3" />
            <div className="w-12 h-8 bg-stone-100 dark:bg-zinc-800 rounded mb-3" />
            <div className="w-full h-3 bg-stone-100 dark:bg-zinc-800 rounded mb-2" />
            <div className="w-3/4 h-3 bg-stone-100 dark:bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
      <div className="mt-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-4 shadow-sm dark:shadow-none">
        <div className="w-32 h-6 bg-stone-100 dark:bg-zinc-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function Optimize({ showToast, setHistory, setStats, prompt, setPrompt }) {
  const [result, setResult] = useState(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [displayOriginal, setDisplayOriginal] = useState(0);
  const [displayOptimized, setDisplayOptimized] = useState(0);
  const [targetLang, setTargetLang] = useState('original');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-dropdown="lang"]')) setLangDropdownOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    if (!result) {
      const timer = setTimeout(() => {
        setDisplayOriginal(0);
        setDisplayOptimized(0);
      }, 0);
      return () => clearTimeout(timer);
    }
    const target1 = result.original.tokenCount;
    const target2 = result.optimized.tokenCount;
    const steps = 30;
    const interval = 800 / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setDisplayOriginal(Math.round(target1 * eased));
      setDisplayOptimized(Math.round(target2 * eased));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [result]);

  const handleOptimize = async () => {
    setResult(null);
    setResultVisible(false);
    setLoading(true);
    setError(null);
    try {
      const data = await optimizePrompt(prompt, targetLang);
      setResult(data);
      setTimeout(() => setResultVisible(true), 50);
      showToast(`%${data.savings.percentage} token tasarruf edildi! ⚡`, 'success');
      getStats().then(setStats).catch(() => {});
      getHistory().then(d => setHistory(d.history)).catch(() => {});
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.optimized.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Panoya kopyalandı! 📋', 'info');
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">{TAB_HEADERS.optimize.title}</h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm">{TAB_HEADERS.optimize.subtitle}</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl shadow-sm hover:border-orange-300 dark:hover:border-orange-500/50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 dark:focus-within:ring-orange-500/10 transition-all">
        <textarea
          className="w-full min-h-36 bg-transparent text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-zinc-600 p-4 resize-none focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Prompt'unuzu buraya yazın..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center justify-between border-t border-stone-100 dark:border-zinc-800 px-3 py-2">
          <div className="flex items-center gap-3">
            <span className={`text-xs ${prompt.length > 3500 ? 'text-red-500' : prompt.length > 3000 ? 'text-orange-700' : 'text-stone-400 dark:text-zinc-600'}`}>
              ~{estimateTokens(prompt)} token · {prompt.length} / 4000
            </span>
            {prompt && (
              <button
                onClick={() => setPrompt('')}
                className="text-xs text-stone-400 dark:text-zinc-600 hover:text-stone-600 dark:hover:text-zinc-400 cursor-pointer transition-colors"
              >
                ✕ temizle
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" data-dropdown="lang">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="text-xs bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-stone-600 dark:text-zinc-400 flex items-center gap-2 cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 transition-all focus:outline-none"
              >
                <span>{LANGUAGES.find(l => l.value === targetLang)?.label || '🌐 Orijinal dil'}</span>
                <span className="text-stone-400 dark:text-zinc-600 text-xs">{langDropdownOpen ? '▲' : '▼'}</span>
              </button>
              {langDropdownOpen && (
                <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl shadow-lg z-20 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden" style={{ maxHeight: '288px' }}>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.value}
                      onClick={() => { setTargetLang(lang.value); setLangDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                        targetLang === lang.value
                          ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400'
                          : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowTemplates((v) => !v)}
              className="text-xs bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:scale-[1.03]"
            >
              Şablonlar
            </button>
            <button
              onClick={handleOptimize}
              disabled={loading || !prompt.trim()}
              className={`text-sm px-4 py-2 ${btn.primary} ${prompt.trim() && !loading ? 'animate-[pulse_1s_ease-in-out_1]' : ''}`}
            >
              {loading ? 'Optimize ediliyor...' : 'Optimize Et'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {showTemplates && (
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl p-3 mt-2 shadow-lg dark:shadow-none">
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setPrompt(t.prompt); setShowTemplates(false); }}
                className="text-xs px-3 py-2 text-left text-stone-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg transition-colors cursor-pointer"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <OptimizeSkeleton />}

      {!result && !loading && (
        <EmptyState
          icon={<LightningIcon size={40} weight="regular" />}
          title="Prompt'unuzu yazın ve optimize edin"
          description="Gereksiz kelimeler kaldırılır, token tasarrufu hesaplanır"
        />
      )}

      {result && !loading && (
        <div className={`mt-6 transition-opacity duration-500 ${resultVisible ? 'opacity-100' : 'opacity-0'}`}>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-xs text-stone-400 dark:text-zinc-500 mb-1 uppercase tracking-widest">Orijinal</div>
              <div className="text-2xl font-bold text-stone-900 dark:text-white">{displayOriginal} <span className="text-sm font-normal text-stone-400">token</span></div>
            </div>
            <div className="text-stone-300 dark:text-zinc-700 text-xl">→</div>
            <div className="text-center">
              <div className="text-xs text-orange-700 mb-1 uppercase tracking-widest">Optimize</div>
              <div className="text-2xl font-bold text-orange-700">{displayOptimized} <span className="text-sm font-normal text-orange-400">token</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5">
            <p className="text-sm text-stone-700 dark:text-zinc-300 leading-relaxed">{result.optimized.prompt}</p>
            <div className="flex justify-end mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800">
              <button
                onClick={handleCopy}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.97] ${
                  copied
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 hover:bg-stone-200 dark:hover:bg-zinc-700'
                }`}
              >
                {copied ? '✓ Kopyalandı!' : 'Kopyala'}
              </button>
            </div>
          </div>

          <div className="mt-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-stone-600 dark:text-zinc-400">
              <span className="text-2xl font-bold text-orange-700">%{result.savings.percentage}</span>
              {' '}tasarruf
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-600 dark:text-zinc-400">
                <span className="font-semibold text-stone-900 dark:text-white">{result.savings.tokens}</span> token kazanıldı
              </span>
              {result.cached && (
                <span className="text-xs bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">
                  ⚡ Önbellekten
                </span>
              )}
            </div>
          </div>

        </div>
      )}
    </>
  );
}
