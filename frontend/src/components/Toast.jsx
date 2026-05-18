export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div
      className={`toast-animate fixed top-4 right-4 z-100 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium ${
        toast.type === 'success'
          ? 'bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400'
          : toast.type === 'error'
          ? 'bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400'
          : 'bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400'
      }`}
    >
      <span className="text-base">
        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
      </span>
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-current opacity-50 hover:opacity-100 cursor-pointer transition-opacity text-xs"
      >
        ✕
      </button>
    </div>
  );
}
