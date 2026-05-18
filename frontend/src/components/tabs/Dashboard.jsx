import { useState, useEffect } from 'react';
import { LightningIcon } from '@phosphor-icons/react';
import { TABS, TAB_DESCRIPTIONS, btn } from '../../constants.jsx';

const TIPS = [
  'Gereksiz nezaket ifadelerini kaldırın: "lütfen", "rica etsem" gibi kelimeler token harcar.',
  'Soru sormak yerine doğrudan komut verin.',
  'Bağlam bilgisini bir kez verin. Aynı bilgiyi tekrar tekrar yazmak token israfıdır.',
  'Kısa ve net olun. Uzun açıklamalar yerine madde madde yazın.',
  'Örnek istemek yerine formatı belirtin. "JSON olarak döndür" daha az token harcar.',
  'Sistem promptunuzu sık sık gözden geçirin. Gereksiz kurallar maliyeti artırır.',
  'Özetleme için tüm metni göndermek yerine anahtar noktaları listeleyin.',
  'Model seçiminde dikkatli olun. Basit görevler için küçük modeller çok daha ucuzdur.',
];

export default function Dashboard({ user, isGuest, stats, handleTabChange, setUser, setIsGuest }) {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">
          {user?.isGuest ? 'Hoş geldiniz! 👋' : `Hoş geldiniz, ${user?.email?.split('@')[0]}! 👋`}
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm">Yapay zeka maliyetlerinizi optimize edin</p>
      </div>

      {isGuest ? (
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-900 dark:text-white mb-1">Misafir olarak kullanıyorsunuz</p>
            <p className="text-xs text-stone-500 dark:text-zinc-400">Geçmişiniz kaydedilmiyor. Tüm özelliklere erişmek için giriş yapın.</p>
          </div>
          <button
            onClick={() => { setUser(null); setIsGuest(false); }}
            className={`ml-4 text-xs px-4 py-2 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shrink-0 ${btn.primary}`}
          >
            Giriş Yap
          </button>
        </div>
      ) : stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-1">{stats.totalOptimizations}</div>
            <div className="text-xs text-stone-400 dark:text-zinc-500">optimizasyon yapıldı</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-1">{stats.totalSavedTokens > 0 ? stats.totalSavedTokens.toLocaleString() : '-'}</div>
            <div className="text-xs text-stone-400 dark:text-zinc-500">token tasarruf edildi</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-1">{stats.avgPercentage > 0 ? `%${stats.avgPercentage}` : '-'}</div>
            <div className="text-xs text-stone-400 dark:text-zinc-500">ortalama tasarruf sağlandı</div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xs font-medium text-stone-400 dark:text-zinc-500 tracking-wider mb-3">
          Ne yapmak istiyorsunuz?
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {TABS
            .filter(tab => tab.id !== 'dashboard')
            .map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 text-left hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="text-orange-500 mb-3 group-hover:scale-110 transition-transform inline-block">
                  {tab.icon}
                </div>
                <div className="text-sm font-medium text-stone-900 dark:text-white mb-1">{tab.label}</div>
                <div className="text-xs text-stone-400 dark:text-zinc-500 leading-relaxed">
                  {TAB_DESCRIPTIONS[tab.id]}
                </div>
              </button>
            ))
          }
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-4 flex items-start gap-3">
        <LightningIcon size={16} className="text-orange-500 shrink-0 mt-0.5" weight="regular" />
        <div>
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400 tracking-wider">İPUCU</span>
          <p className="text-sm text-stone-600 dark:text-zinc-400 mt-1 transition-all duration-500">
            {TIPS[currentTip]}
          </p>
        </div>
      </div>
    </div>
  );
}
