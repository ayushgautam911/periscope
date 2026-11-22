import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="space-y-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        404
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        This page doesn’t exist (yet).
      </p>
      <Link
        to="/"
        className="inline-block text-indigo-700 hover:underline dark:text-indigo-400"
      >
        ← Back home
      </Link>
    </section>
  )
}
