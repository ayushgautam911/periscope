import { useEffect, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Runs an async function and tracks loading/error/data, re-running whenever
 * `deps` change. Guards against setting state after unmount or after a newer
 * run has superseded this one (avoids race conditions on fast navigation).
 */
export function useAsync<T>(
  run: () => Promise<T>,
  deps: React.DependencyList,
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true
    setState({ data: null, loading: true, error: null })

    run().then(
      (data) => {
        if (active) setState({ data, loading: false, error: null })
      },
      (error: unknown) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      },
    )

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
