import { useState } from 'react';
import { CalculatorIcon } from '@phosphor-icons/react';
import { CALC_SCENARIOS, MODEL_PRICES, TAB_HEADERS, btn } from '../../constants.jsx';
import EmptyState from '../EmptyState.jsx';

export default function Calculator() {
  const [calcInputTokens, setCalcInputTokens] = useState('');
  const [calcOutputTokens, setCalcOutputTokens] = useState('');
  const [calcRequests, setCalcRequests] = useState('1');
  const [calcResults, setCalcResults] = useState(null);

  const calculateCost = () => {
    const input = parseInt(calcInputTokens) || 0;
    const output = parseInt(calcOutputTokens) || 0;
    const requests = parseInt(calcRequests) || 1;

    const results = MODEL_PRICES.map(model => {
      const inputCost = (input / 1000) * model.inputPer1k * requests;
      const outputCost = (output / 1000) * model.outputPer1k * requests;
      const totalCost = inputCost + outputCost;
      const monthlyCost = totalCost * 30;
      return {
        ...model,
        inputCost,
        outputCost,
        totalCost,
        monthlyCost,
        totalFormatted: totalCost < 0.000001 ? '< $0.000001' : `$${totalCost.toFixed(6)}`,
        monthlyFormatted: monthlyCost < 0.01 ? '< $0.01' : `$${monthlyCost.toFixed(2)}`,
      };
    }).sort((a, b) => a.totalCost - b.totalCost);

    setCalcResults(results);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">{TAB_HEADERS.calculator.title}</h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm">{TAB_HEADERS.calculator.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CALC_SCENARIOS.map(s => (
          <button
            key={s.label}
            onClick={() => { setCalcInputTokens(String(s.input)); setCalcOutputTokens(String(s.output)); }}
            className="text-xs bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all hover:scale-[1.02]"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-zinc-500 mb-2 block tracking-wider">GİRDİ TOKEN</label>
            <input
              type="number"
              value={calcInputTokens}
              onChange={e => setCalcInputTokens(e.target.value)}
              placeholder="1000"
              className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
            />
            <p className="text-xs text-stone-400 dark:text-zinc-600 mt-1">AI'ya gönderdiğiniz metin (prompt)</p>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-zinc-500 mb-2 block tracking-wider">ÇIKTI TOKEN</label>
            <input
              type="number"
              value={calcOutputTokens}
              onChange={e => setCalcOutputTokens(e.target.value)}
              placeholder="500"
              className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
            />
            <p className="text-xs text-stone-400 dark:text-zinc-600 mt-1">Beklediğiniz cevap uzunluğu</p>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-zinc-500 mb-2 block tracking-wider">GÜNLÜK İSTEK</label>
            <input
              type="number"
              value={calcRequests}
              onChange={e => setCalcRequests(e.target.value)}
              placeholder="1"
              className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
            />
            <p className="text-xs text-stone-400 dark:text-zinc-600 mt-1">Günde kaç kez kullanacaksınız?</p>
          </div>
        </div>

        <button
          onClick={calculateCost}
          disabled={!calcInputTokens && !calcOutputTokens}
          className={`w-full text-sm py-3 rounded-xl font-medium transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${btn.primary}`}
        >
          Hesapla
        </button>
        <p className="text-xs text-stone-400 dark:text-zinc-600 text-center mt-3">
          Fiyatlar tahminidir. Güncel fiyatlar için model sağlayıcısını kontrol edin.
        </p>
      </div>

      {calcResults && (
        <div>
          <h3 className="text-xs font-medium text-stone-400 dark:text-zinc-500 tracking-wider mb-3">
            Model karşılaştırması — ucuzdan pahalıya
          </h3>
          <div className="flex flex-col gap-2">
            {calcResults.map((model, i) => (
              <div
                key={model.id}
                className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${
                  i === 0
                    ? 'border-orange-300 dark:border-orange-500/50 bg-orange-50 dark:bg-orange-500/5'
                    : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {i === 0 && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full font-medium shrink-0">En Ucuz</span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-stone-900 dark:text-white">{model.name}</span>
                      <span className="text-xs text-stone-400 dark:text-zinc-500">{model.provider}</span>
                    </div>
                    <div className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">Aylık tahmini: {model.monthlyFormatted}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${i === 0 ? 'text-orange-500' : 'text-stone-900 dark:text-white'}`}>
                    {model.totalFormatted}
                  </div>
                  <div className="text-xs text-stone-400 dark:text-zinc-500">per istek</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!calcResults && (
        <EmptyState
          icon={<CalculatorIcon size={40} weight="regular" />}
          title="Token sayılarını girin ve hesaplayın"
          description="Girdi, çıktı token ve günlük istek sayısına göre maliyet hesaplanır"
        />
      )}
    </div>
  );
}
