import { SunDimIcon, MoonIcon, SignOutIcon, LockIcon } from '@phosphor-icons/react';
import { TABS } from '../constants.jsx';

export default function Sidebar({ activeTab, handleTabChange, user, isGuest, onLogout, toggleDarkMode, darkMode, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <>
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="md:hidden fixed top-0 left-0 h-full w-64 bg-white dark:bg-zinc-900 border-r border-stone-100 dark:border-zinc-800 z-50 flex flex-col py-4 shadow-lg">
            <div className="flex items-center gap-2 px-4 mb-6">
              <img src="/logo.svg" alt="Promptune" className="w-11 h-11" />
              <span className="font-bold text-stone-900 dark:text-white">
                prompt<span className="text-orange-500">une</span>
              </span>
            </div>
            <div className="flex flex-col gap-1 px-2 flex-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { handleTabChange(tab.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === tab.id
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'text-stone-500 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="shrink-0">{tab.icon}</span>
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="px-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
              <p className="text-stone-400 dark:text-zinc-600 text-xs mb-3 truncate">{user?.email}</p>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 text-sm transition-colors cursor-pointer mb-3"
              >
                {darkMode ? <SunDimIcon size={16} weight="regular" /> : <MoonIcon size={16} weight="regular" />}
                <span>{darkMode ? 'Açık Mod' : 'Koyu Mod'}</span>
              </button>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-stone-400 dark:text-zinc-500 hover:text-red-500 text-sm transition-colors cursor-pointer"
              >
                <SignOutIcon size={16} weight="regular" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </>
      )}

      <nav className="hidden md:flex group w-16 hover:w-52 transition-all duration-300 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border-r border-stone-100 dark:border-zinc-800 shadow-sm dark:shadow-none flex-col justify-between py-4 overflow-hidden shrink-0">
        <div className="flex flex-col gap-1">
          {TABS.map(({ id, icon, label }) => {
            const locked = isGuest && (id === 'vision' || id === 'history');
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                style={{ width: 'calc(100% - 16px)' }}
                className={`flex items-center gap-3 mx-2 px-3 py-3 rounded-xl transition-all duration-150 cursor-pointer hover:translate-x-1 ${
                  locked ? 'opacity-50' : ''
                } ${
                  activeTab === id
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-l-2 border-orange-500'
                    : 'text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="shrink-0">{locked ? <LockIcon size={18} weight="regular" /> : icon}</span>
                <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 px-2">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2">
            {isGuest
              ? <span className="text-xs text-stone-400 dark:text-zinc-500 bg-stone-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">👀 Misafir</span>
              : <p className="text-stone-400 dark:text-zinc-600 text-xs truncate">{user.email}</p>
            }
          </div>
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer text-stone-400 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-800 w-full"
          >
            <span className="shrink-0">
              {darkMode ? <SunDimIcon size={18} weight="regular" /> : <MoonIcon size={18} weight="regular" />}
            </span>
            <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {darkMode ? 'Açık Mod' : 'Koyu Mod'}
            </span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer text-stone-400 dark:text-zinc-500 hover:text-red-500 hover:bg-stone-50 dark:hover:bg-zinc-800 w-full"
          >
            <span className="shrink-0"><SignOutIcon size={18} weight="regular" /></span>
            <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {isGuest ? 'Giriş Yap' : 'Çıkış'}
            </span>
          </button>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 pb-1">
            <p className="text-stone-300 dark:text-zinc-700 text-xs whitespace-nowrap">Less tokens.</p>
          </div>
        </div>
      </nav>
    </>
  );
}
