interface StatusMessageProps {
  title: string
  detail?: string
}

/** Centered placeholder used for loading / empty / error states. */
export default function StatusMessage({ title, detail }: StatusMessageProps) {
  return (
    <div className="py-16 text-center">
      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {title}
      </p>
      {detail && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {detail}
        </p>
      )}
    </div>
  )
}
