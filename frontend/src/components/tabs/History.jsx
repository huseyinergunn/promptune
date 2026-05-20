import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { getHistory, deleteHistory } from '../../services/api';
import { TAB_HEADERS } from '../../constants.jsx';

function SavingsChart({ history, title }) {
  const chartData = [...history]
    .reverse()
    .map((item, index) => ({
      index: index + 1,
      percentage: item.percentage > 0 ? item.percentage : 0,
      tokens: item.savedTokens > 0 ? item.savedTokens : 0,
      prompt: item.originalPrompt.slice(0, 20) + '...',
    }));

  return (
    <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 mb-6">
      <h3 className="text-sm font-medium text-stone-600 dark:text-zinc-400 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" className="dark:stroke-zinc-800" />
          <XAxis
            dataKey="index"
            tick={{ fontSize: 11, fill: '#a8a29e' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Optimizasyon', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#a8a29e' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#a8a29e' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `%${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
            formatter={(value) => [`%${value}`, 'Tasarruf']}
            labelFormatter={(label) => `${label}. optimizasyon`}
          />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#colorPct)"
            dot={{ fill: '#f97316', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#f97316' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function History({ showToast, history, setHistory, setStats, handleTabChange, setPrompt }) {
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    setHistoryLoading(true);
    getHistory()
      .then(data => setHistory(data.history))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [setHistory]);

  const handleDeleteHistory = async () => {
    try {
      await deleteHistory();
      setHistory([]);
      setStats({ totalOptimizations: 0, totalSavedTokens: 0, avgPercentage: 0 });
      showToast('Geçmişiniz temizlendi.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">{TAB_HEADERS.history.title}</h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm">{TAB_HEADERS.history.subtitle}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-stone-400 text-xs">Son 20 optimizasyon</span>
        {history.length > 0 && (
          <button
            onClick={handleDeleteHistory}
            className="cursor-pointer text-red-400 hover:text-red-600 text-xs transition-colors"
          >
            Geçmişi Temizle
          </button>
        )}
      </div>

      {historyLoading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-4 animate-pulse shadow-sm dark:shadow-none">
              <div className="w-3/4 h-3 bg-stone-100 dark:bg-zinc-800 rounded mb-3" />
              <div className="w-1/2 h-3 bg-stone-100 dark:bg-zinc-800 rounded mb-3" />
              <div className="w-full h-3 bg-stone-100 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {!historyLoading && history.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-stone-300 dark:text-zinc-700 mb-4"><ClockCounterClockwiseIcon size={40} weight="regular" /></div>
          <p className="text-stone-400 dark:text-zinc-600 text-sm">Henüz optimizasyon geçmişi yok</p>
          <p className="text-stone-300 dark:text-zinc-700 text-xs mt-1">İlk prompt'unuzu optimize edin</p>
          <button
            onClick={() => handleTabChange('optimize')}
            className="mt-4 text-orange-700 hover:text-orange-600 text-xs cursor-pointer transition-colors"
          >
            Prompt Optimize'a git →
          </button>
        </div>
      )}

      {!historyLoading && history.length > 1 && (
        <SavingsChart history={history} title="Tasarruf Geçmişi" />
      )}

      {!historyLoading && history.length > 0 && (
        <div className="flex flex-col gap-3">
          {history.map((item) => (
            <div
              key={item._id}
              onClick={() => { setPrompt(item.originalPrompt); handleTabChange('optimize'); }}
              className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-500/40 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.005] shadow-sm dark:shadow-none"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-600 dark:text-zinc-400 text-sm truncate max-w-xs">
                  {item.originalPrompt.length > 60
                    ? item.originalPrompt.slice(0, 60) + '...'
                    : item.originalPrompt}
                </span>
                <span className="text-stone-400 dark:text-zinc-600 text-xs shrink-0 ml-2">
                  {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-stone-900 dark:text-white font-medium text-sm">{item.originalTokenCount}</span>
                <span className="text-stone-300 dark:text-zinc-700 text-xs">→</span>
                <span className="text-stone-900 font-medium text-sm">{item.optimizedTokenCount}</span>
                <span className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                  %{item.percentage} tasarruf
                </span>
              </div>

              <p className="text-stone-400 dark:text-zinc-600 text-xs truncate">
                {item.optimizedPrompt.length > 80
                  ? item.optimizedPrompt.slice(0, 80) + '...'
                  : item.optimizedPrompt}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
