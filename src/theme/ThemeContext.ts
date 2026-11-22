import { createContext, useContext } from 'react'

/** User's chosen preference. `system` follows the OS setting live. */
export type ThemeMode = 'light' | 'dark' | 'system'

/** What's actually applied to the page right now. */
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

/** localStorage key shared with the FOUC-prevention script in index.html. */
export const THEME_STORAGE_KEY = 'periscope-theme'

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
