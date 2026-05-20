import { useState } from 'react';
import { SunDimIcon, MoonIcon } from '@phosphor-icons/react';
import { TABS } from '../constants.jsx';

export default function Header({ darkMode, toggleDarkMode, activeTab, mobileMenuOpen, onMenuToggle, handleTabChange }) {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <header className="relative z-10 bg-white/40 dark:bg-zinc-900/90 backdrop-blur-md border-b border-stone-100 dark:border-zinc-700 px-4 py-2 flex items-center justify-between shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95"
          >
            <span className={`block w-5 h-0.5 bg-stone-400 dark:bg-zinc-500 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-stone-400 dark:bg-zinc-500 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-stone-400 dark:bg-zinc-500 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
          <button
            onClick={() => handleTabChange('dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src="/logo.svg" alt="Promptune" className="w-7 ml-1 h-auto block" />
            <span className=" ml-2.5 w-px h-5 bg-stone-200 dark:bg-zinc-700 shrink-0" />
            <img src="/logo-text.svg" alt="promptune" className="h-7 mt-3 ml-0 w-auto block" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { id: 'how', label: 'Nasıl Çalışır?' },
            { id: 'pricing', label: 'Fiyatlandırma' },
            { id: 'privacy', label: 'Gizlilik' },
            { id: 'about', label: 'Hakkında' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveModal(item.id)}
              className="text-xs text-stone-500 dark:text-zinc-500 hover:text-stone-800 dark:hover:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="md:hidden text-stone-500 dark:text-zinc-400 text-sm">
          {TABS.find(t => t.id === activeTab)?.label}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Açık temaya geç' : 'Koyu temaya geç'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
          >
            {darkMode
              ? <><SunDimIcon size={16} weight="regular" /><span className="text-xs font-medium hidden sm:block">Açık</span></>
              : <><MoonIcon size={16} weight="regular" /><span className="text-xs font-medium hidden sm:block">Koyu</span></>
            }
          </button>
        </div>
      </header>

      {activeModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setActiveModal(null)}
          />

          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl shadow-xl p-6">

            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300 cursor-pointer text-lg"
            >
              ✕
            </button>

            {activeModal === 'how' && (
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Nasıl Çalışır?</h2>
                <div className="flex flex-col gap-4">
                  {[
                    { step: '1', title: 'Prompt alınır', desc: 'Kullanıcının girdiği metin veya kod sisteme iletilir. Maksimum 4000 karakter kabul edilir.' },
                    { step: '2', title: 'Token sayımı yapılır', desc: 'Google Gemini countTokens API\'si ile token sayısı hesaplanır. Arayüzdeki anlık sayaç ise hız için tahmini hesaplama kullanır (4 karakter ≈ 1 token).' },
                    { step: '3', title: 'Optimizasyon uygulanır', desc: 'Groq Llama 3.3 70B modeli gereksiz kelimeler, nezaket ifadeleri ve tekrarları kaldırır. Anlam ve amaç korunur.' },
                    { step: '4', title: 'Tasarruf hesaplanır', desc: 'Orijinal ve optimize token sayısı karşılaştırılır. Tasarruf yüzdesi ve kazanılan token miktarı gösterilir.' },
                    { step: '5', title: 'Görsel analiz yapılır', desc: 'Görsel Analiz sekmesinde Google Gemini 2.5 Flash Vision API devreye girer. Görseldeki metin okunur, ardından Groq ile optimize edilir.' },
                  ].map(item => (
                    <div key={item.step} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-900 dark:text-white mb-0.5">{item.title}</p>
                        <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'pricing' && (
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-1">Fiyatlandırma</h2>
                <p className="text-xs text-stone-400 dark:text-zinc-500 mb-4">Promptune tamamen ücretsizdir.</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Prompt Optimizasyon', value: 'Ücretsiz', note: 'Groq ücretsiz katman — dakikada 5 istek' },
                    { label: 'Chat Özetleme', value: 'Ücretsiz', note: 'Groq ücretsiz katman' },
                    { label: 'Görsel Analiz', value: 'Ücretsiz', note: 'Gemini 2.5 Flash ücretsiz katman' },
                    { label: 'Model Karşılaştırma', value: 'Ücretsiz', note: 'API çağrısı yapılmaz, hesaplama anında' },
                    { label: 'Token Hesaplayıcı', value: 'Ücretsiz', note: 'Tamamen tarayıcıda çalışır' },
                    { label: 'Geçmiş & İstatistikler', value: 'Ücretsiz', note: 'MongoDB\'de saklanır' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-zinc-800 last:border-0">
                      <div>
                        <p className="text-sm text-stone-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-stone-400 dark:text-zinc-500">{item.note}</p>
                      </div>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Gizlilik</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: '🔐', title: 'Şifreler güvende', desc: 'Şifreler bcrypt ile hashlenerek saklanır. Hiçbir zaman düz metin olarak tutulmaz.' },
                    { icon: '💾', title: 'Veriler nerede saklanır?', desc: 'Optimizasyon geçmişiniz MongoDB\'de kullanıcı ID\'nize bağlı olarak saklanır. Başkaları göremez.' },
                    { icon: '🤖', title: 'AI\'ya ne gönderiliyor?', desc: 'Yazdığınız prompt Groq veya Gemini API\'sine gönderilir. Bu servisler kendi gizlilik politikalarına tabidir.' },
                    { icon: '🍪', title: 'Çerez kullanımı', desc: 'JWT token sessionStorage\'da saklanır. Tarayıcı kapanınca otomatik silinir.' },
                    { icon: '📊', title: 'Analitik', desc: 'Herhangi bir üçüncü taraf analitik veya reklam servisi kullanılmamaktadır.' },
                  ].map(item => (
                    <div key={item.title} className="flex gap-3">
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-900 dark:text-white mb-0.5">{item.title}</p>
                        <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'about' && (
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-1">Promptune Hakkında</h2>
                <p className="text-xs text-stone-400 dark:text-zinc-500 mb-4">Less tokens, more intelligence.</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Stack', value: 'React + Node.js + MongoDB' },
                    { label: 'AI Modelleri', value: 'Groq Llama 3.3 70B + Gemini 2.5 Flash' },
                    { label: 'Optimizasyon', value: 'Prompt sıkıştırma, chat özetleme, görsel analiz' },
                    { label: 'Cache', value: 'MongoDB TTL — 7 gün' },
                    { label: 'Rate Limiting', value: 'Dakikada 5 optimizasyon isteği' },
                    { label: 'Versiyon', value: 'v1.0.0' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-zinc-800 last:border-0">
                      <span className="text-sm text-stone-500 dark:text-zinc-400">{item.label}</span>
                      <span className="text-sm font-medium text-stone-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 dark:border-zinc-800 text-center">
                  <p className="text-xs text-stone-400 dark:text-zinc-600">
                    Yapay zeka maliyetlerinizi optimize etmek için tasarlandı.
                  </p>
                </div>
              </div>
            )}

          </div>
        </>
      )}
    </>
  );
}
