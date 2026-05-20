import { useState, useEffect } from 'react';
import { GitDiffIcon } from '@phosphor-icons/react';
import { compareModels, compareOptimizations } from '../../services/api';
import { TASK_TYPES, TAB_HEADERS, btn, estimateTokens } from '../../constants.jsx';
import EmptyState from '../EmptyState.jsx';

export default function Compare({ showToast }) {
  const [compareSubTab, setCompareSubTab] = useState('model');
  const [tokenCount, setTokenCount] = useState('');
  const [taskType, setTaskType] = useState('genel');
  const [taskDropdownOpen, setTaskDropdownOpen] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState(null);
  const [compareOptInput, setCompareOptInput] = useState(() => sessionStorage.getItem('savedCompareInput') || '');
  const [compareOptResults, setCompareOptResults] = useState(null);
  const [compareOptLoading, setCompareOptLoading] = useState(false);
  const [compareOptError, setCompareOptError] = useState(null);
  const [selectedApproach, setSelectedApproach] = useState(null);

  useEffect(() => {
    sessionStorage.setItem('savedCompareInput', compareOptInput);
  }, [compareOptInput]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-dropdown="task"]')) setTaskDropdownOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleCompare = async () => {
    setCompareLoading(true);
    setCompareError(null);
    try {
      const data = await compareModels(Number(tokenCount), taskType);
      setCompareResult(data);
    } catch (err) {
      setCompareError(err.message);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleCompareOpt = async () => {
    setCompareOptLoading(true);
    setCompareOptError(null);
    setCompareOptResults(null);
    try {
      const data = await compareOptimizations(compareOptInput);
      setCompareOptResults(data.results);
      showToast('3 yaklaşım hazır, birini seçin!', 'success');
    } catch (err) {
      setCompareOptError(err.message);
      showToast(err.message, 'error');
    } finally {
      setCompareOptLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">{TAB_HEADERS.compare.title}</h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm">{TAB_HEADERS.compare.subtitle}</p>
      </div>

      <div className="flex bg-stone-100 dark:bg-zinc-800 rounded-xl p-1 mb-6">
        <button
          onClick={() => setCompareSubTab('model')}
          className={`flex-1 text-sm py-2 px-4 rounded-lg transition-all cursor-pointer font-medium ${
            compareSubTab === 'model'
              ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm'
              : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-300'
          }`}
        >
          ⚖ Model Karşılaştır
        </button>
        <button
          onClick={() => setCompareSubTab('approach')}
          className={`flex-1 text-sm py-2 px-4 rounded-lg transition-all cursor-pointer font-medium ${
            compareSubTab === 'approach'
              ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm'
              : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-300'
          }`}
        >
          🔀 Yaklaşım Karşılaştır
        </button>
      </div>

      {compareSubTab === 'model' && (<>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-stone-400 dark:text-zinc-600 tracking-widest mb-2">TOKEN SAYISI</p>
            <input
              type="number"
              min={1}
              max={1000000}
              value={tokenCount}
              onChange={(e) => setTokenCount(e.target.value)}
              placeholder="Token sayısı (örn: 1000)"
              className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-stone-900 dark:text-white text-sm w-full focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/10 placeholder-stone-400 dark:placeholder-zinc-600 transition-all"
            />
          </div>
          <div>
            <p className="text-xs text-stone-400 dark:text-zinc-600 tracking-widest mb-2">GÖREV TİPİ</p>
            <div className="relative" data-dropdown="task">
              <button
                onClick={() => setTaskDropdownOpen(!taskDropdownOpen)}
                className="cursor-pointer w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-stone-900 dark:text-white text-sm flex items-center justify-between focus:outline-none hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors"
              >
                <span>{TASK_TYPES.find((t) => t.value === taskType)?.label || 'Genel'}</span>
                <span className="text-stone-400 dark:text-zinc-600 text-xs ml-2">{taskDropdownOpen ? '▲' : '▼'}</span>
              </button>
              {taskDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl overflow-hidden z-10 shadow-lg dark:shadow-none">
                  {TASK_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setTaskType(t.value); setTaskDropdownOpen(false); }}
                      className={`cursor-pointer w-full px-4 py-3 text-sm text-left transition-colors ${
                        taskType === t.value
                          ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400'
                          : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={compareLoading || !tokenCount}
          className={`mt-4 w-full text-sm px-4 py-3 ${btn.primary}`}
        >
          {compareLoading ? 'Karşılaştırılıyor...' : 'Karşılaştır'}
        </button>

        {compareError && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-red-600 text-sm">{compareError}</p>
          </div>
        )}

        {!compareResult && !compareLoading && !compareError && (
          <EmptyState
            icon={<GitDiffIcon size={40} weight="regular" />}
            title="Token sayısı ve görev tipini seçin"
            description="Hangi model daha uygun, birlikte bulalım"
          />
        )}

        {compareResult && (
          <div className="mt-6 flex flex-col gap-3">
            {compareResult.models.map((model) => (
              <div
                key={model.id}
                className={`rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01] cursor-default ${
                  model.recommended
                    ? 'border-2 border-orange-400 bg-orange-50 dark:bg-orange-500/10'
                    : 'bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 hover:border-stone-300 dark:hover:border-zinc-600 shadow-sm dark:shadow-none'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-900 dark:text-white font-medium text-sm">{model.name}</span>
                    <span className="text-stone-400 dark:text-zinc-600 text-xs">{model.provider}</span>
                  </div>
                  {model.recommended && (
                    <span className="text-xs text-white bg-orange-600 px-2 py-1 rounded-full">✦ Önerilen</span>
                  )}
                </div>
                <div className="mb-3">
                  <span className={`text-2xl font-bold ${model.recommended ? 'text-orange-700' : 'text-stone-900'}`}>
                    {model.totalCostFormatted}
                  </span>
                  <span className="text-stone-400 text-xs ml-2">/ {compareResult.tokenCount} token</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {model.strengths.map((s) => (
                    <span key={s} className="bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 text-xs px-2 py-1 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </>)}

      {compareSubTab === 'approach' && (<>
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-1 mb-6">
          <textarea
            className="w-full min-h-32 bg-transparent text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-zinc-600 p-4 resize-none focus:outline-none text-sm"
            placeholder="Karşılaştırmak istediğiniz prompt'u yazın..."
            value={compareOptInput}
            onChange={e => setCompareOptInput(e.target.value)}
          />
          <div className="flex items-center justify-between border-t border-stone-100 dark:border-zinc-800 px-3 py-2">
            <span className="text-xs text-stone-400 dark:text-zinc-600">
              ~{estimateTokens(compareOptInput)} token · {compareOptInput.length} / 4000
            </span>
            <button
              onClick={handleCompareOpt}
              disabled={compareOptLoading || !compareOptInput.trim()}
              className={`text-sm px-4 py-2 ${btn.primary}`}
            >
              {compareOptLoading ? 'Karşılaştırılıyor...' : '3 Yaklaşımı Karşılaştır'}
            </button>
          </div>
        </div>

        {compareOptError && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-4 mb-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{compareOptError}</p>
          </div>
        )}

        {compareOptLoading && (
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 animate-pulse">
                <div className="w-20 h-3 bg-stone-100 dark:bg-zinc-800 rounded mb-3" />
                <div className="w-12 h-8 bg-stone-100 dark:bg-zinc-800 rounded mb-3" />
                <div className="w-full h-3 bg-stone-100 dark:bg-zinc-800 rounded mb-2" />
                <div className="w-3/4 h-3 bg-stone-100 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {compareOptResults && (
          <div>
            <h3 className="text-xs font-medium text-stone-400 dark:text-zinc-500 tracking-wider mb-3">
              3 farklı yaklaşım — birini seçin
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {compareOptResults.map(result => (
                <div
                  key={result.id}
                  onClick={() => setSelectedApproach(result.id)}
                  className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${
                    selectedApproach === result.id
                      ? 'border-orange-400 dark:border-orange-500 ring-2 ring-orange-200 dark:ring-orange-500/20'
                      : 'border-stone-200 dark:border-zinc-700 hover:border-orange-200 dark:hover:border-orange-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-stone-900 dark:text-white">{result.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      result.percentage > 40
                        ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                        : result.percentage > 20
                        ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400'
                    }`}>
                      %{result.percentage > 0 ? result.percentage : 0}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 dark:text-zinc-500 mb-3">{result.desc}</p>
                  <div className="border-t border-stone-100 dark:border-zinc-800 pt-3">
                    <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                      {result.optimizedPrompt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 dark:border-zinc-800">
                    <span className="text-xs text-stone-400 dark:text-zinc-500">
                      {result.originalTokens} → {result.optimizedTokens} token
                    </span>
                    {selectedApproach === result.id && (
                      <span className="text-xs text-orange-700 font-medium">✓ Seçildi</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedApproach && (
              <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-900 dark:text-white mb-1">
                    {compareOptResults.find(r => r.id === selectedApproach)?.name} yaklaşımı seçildi
                  </p>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 truncate">
                    {compareOptResults.find(r => r.id === selectedApproach)?.optimizedPrompt}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const selected = compareOptResults.find(r => r.id === selectedApproach);
                    navigator.clipboard.writeText(selected.optimizedPrompt);
                    showToast('Optimize edilmiş prompt kopyalandı!', 'success');
                  }}
                  className={`ml-4 text-xs px-4 py-2 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shrink-0 ${btn.primary}`}
                >
                  Kopyala
                </button>
              </div>
            )}
          </div>
        )}

        {!compareOptResults && !compareOptLoading && (
          <EmptyState
            icon={<GitDiffIcon size={40} weight="regular" />}
            title="Prompt'unuzu yazın ve 3 yaklaşımı karşılaştırın"
            description="Agresif, dengeli ve minimal optimizasyon sonuçlarını görün"
          />
        )}
      </>)}
    </div>
  );
}
