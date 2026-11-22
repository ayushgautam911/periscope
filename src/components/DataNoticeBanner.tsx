/**
 * Honest, always-visible disclosure about the current dataset — what it is and
 * what it isn't. Message comes from the data layer (`DATA_NOTICE`).
 */
export default function DataNoticeBanner({ message }: { message: string }) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
      {message}
    </div>
  )
}
