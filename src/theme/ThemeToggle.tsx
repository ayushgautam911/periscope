import { useTheme, type ThemeMode } from './ThemeContext'

const CYCLE: ThemeMode[] = ['light', 'dark', 'system']
const LABEL: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (mode === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  }
  if (mode === 'dark') {
    return (
      <svg {...common}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

/**
 * Single icon button that cycles Light → Dark → System. Accessible: the label
 * announces the current mode and what clicking will switch to.
 */
export default function ThemeToggle() {
  const { mode, setMode } = useTheme()
  const next = CYCLE[(CYCLE.indexOf(mode) + 1) % CYCLE.length]

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      title={`Theme: ${LABEL[mode]} — switch to ${LABEL[next]}`}
      aria-label={`Theme: ${LABEL[mode]}. Switch to ${LABEL[next]}.`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      <ThemeIcon mode={mode} />
    </button>
  )
}
