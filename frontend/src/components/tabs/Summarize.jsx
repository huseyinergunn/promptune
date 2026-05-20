import { useState, useEffect } from 'react';
import { FileTextIcon } from '@phosphor-icons/react';
import { summarizeChat } from '../../services/api';
import { TAB_HEADERS, btn, estimateTokens } from '../../constants.jsx';
import EmptyState from '../EmptyState.jsx';

export default function Summarize({ showToast }) {
  const [chatInput, setChatInput] = useState(() => sessionStorage.getItem('savedChatInput') || '');
  const [summaryResult, setSummaryResult] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    sessionStorage.setItem('savedChatInput', chatInput);
  }, [chatInput]);

  const handleSummarize = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      let messages;
      try {
        messages = JSON.parse(chatInput);
      } catch {
        throw new Error('Geçersiz JSON formatı');
      }
      const data = await summarizeChat(messages);
      setSummaryResult(data);
      showToast('Konuşma başarıyla özetlendi!', 'success');
    } catch (err) {
      setSummaryError(err.message);
      showToast(err.message, 'error');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">{TAB_HEADERS.summarize.title}</h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm">{TAB_HEADERS.summarize.subtitle}</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl shadow-sm dark:shadow-none hover:border-orange-300 dark:hover:border-orange-500/50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 dark:focus-within:ring-orange-500/10 transition-all">
        <textarea
          className="w-full min-h-36 bg-transparent text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-zinc-600 p-4 resize-none focus:outline-none text-sm font-mono"
          placeholder='[{"role":"user","content":"Merhaba"},{"role":"assistant","content":"Merhaba! Nasıl yardımcı olabilirim?"}]'
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
        />
        <div className="flex items-center justify-between border-t border-stone-100 dark:border-zinc-800">
          <div className="text-xs text-stone-400 dark:text-zinc-600 p-3">
            ~{estimateTokens(chatInput)} token · {chatInput.length} karakter
          </div>
          <button
            onClick={handleSummarize}
            disabled={summaryLoading || !chatInput.trim()}
            className={`text-sm px-4 py-2 m-1 ${btn.primary}`}
          >
            {summaryLoading ? 'Özetleniyor...' : 'Özetle'}
          </button>
        </div>
      </div>

      {summaryError && (
        <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-red-600 text-sm">{summaryError}</p>
        </div>
      )}

      {!summaryResult && !summaryLoading && (
        <EmptyState
          icon={<FileTextIcon size={40} weight="regular" />}
          title="Mesajlarınızı JSON formatında girin"
          description="En az 4 mesaj gereklidir"
        />
      )}

      {summaryResult && (
        <div className="mt-6">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 shadow-sm dark:shadow-none">
            <p className="text-xs text-stone-400 dark:text-zinc-600 font-medium tracking-widest mb-3">ÖZET</p>
            <p className="text-stone-900 dark:text-zinc-100 text-sm leading-relaxed">{summaryResult.summary}</p>
          </div>

          <div className="mt-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-stone-600 dark:text-zinc-400">
              <span className="text-2xl font-bold text-orange-700">%{summaryResult.savings.percentage}</span>
              {' '}tasarruf
            </span>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <span>
                <span className="font-semibold text-stone-900 dark:text-white">{summaryResult.savings.tokens}</span> token kazanıldı
              </span>
              <span className="text-stone-300 dark:text-zinc-700">·</span>
              <span>
                <span className="font-semibold text-stone-900 dark:text-white">{summaryResult.originalMessages}</span> mesaj
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
