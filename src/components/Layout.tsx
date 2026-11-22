import { Link, Outlet } from 'react-router-dom'
import { DATA_NOTICE } from '../data'
import ThemeToggle from '../theme/ThemeToggle'
import DataNoticeBanner from './DataNoticeBanner'

/**
 * App shell shared by every page: optional disclosure banner, header (with the
 * theme toggle), main content slot, footer. Mobile-first; the same shell
 * carries into the Capacitor build later.
 */
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      {DATA_NOTICE && <DataNoticeBanner message={DATA_NOTICE} />}

      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100"
          >
            Periscope
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:inline dark:text-gray-400">
              Know your candidates
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-6 py-6 text-sm text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Periscope · Helping voters decide
        </div>
      </footer>
    </div>
  )
}
