export default function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-stone-300 dark:text-zinc-700 mb-4">{icon}</div>
      <p className="text-stone-400 dark:text-zinc-600 text-sm">{title}</p>
      <p className="text-stone-300 dark:text-zinc-700 text-xs mt-1">{description}</p>
    </div>
  );
}
