import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ThemeContext,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemeMode,
} from './ThemeContext'

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  // Default is LIGHT (not system): first-time visitors get light mode; dark
  // is an explicit choice via the toggle (which can also select "system").
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'light'
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function resolve(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? systemTheme() : mode
}

/** Reflect the resolved theme onto <html> so Tailwind's `dark:` variant works. */
function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

/**
 * Owns the theme preference: persists the user's choice, resolves `system`
 * against the OS (and tracks live changes), and applies the result to <html>.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolve(readStoredMode()),
  )

  // Apply whenever the chosen mode changes.
  useEffect(() => {
    const resolved = resolve(mode)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [mode])

  // While following the system, react to OS theme changes in real time.
  useEffect(() => {
    if (mode !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const resolved = systemTheme()
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  const setMode = useCallback((next: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, next)
    setModeState(next)
  }, [])

  const value = useMemo(
    () => ({ mode, resolvedTheme, setMode }),
    [mode, resolvedTheme, setMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
