import { Link, useParams } from 'react-router-dom'
import { candidateRepository } from '../../data'
import type { ConstituencySummary } from '../../data'
import type { House } from '../../domain/types'
import PartyChip from '../../components/PartyChip'
import StatusMessage from '../../components/StatusMessage'
import { useAsync } from '../../hooks/useAsync'
import { AVAILABLE_STATES } from '../../data/states'

/** Order houses with the national seats first. */
const HOUSE_ORDER: House[] = ['Lok Sabha', 'Vidhan Sabha']

function groupByHouse(
  summaries: ConstituencySummary[],
): { house: House; items: ConstituencySummary[] }[] {
  return HOUSE_ORDER.map((house) => ({
    house,
    items: summaries.filter((s) => s.constituency.house === house),
  })).filter((group) => group.items.length > 0)
}

function SummaryCard({
  summary,
  stateId,
}: {
  summary: ConstituencySummary
  stateId: string
}) {
  const { constituency, leader } = summary
  return (
    <Link
      to={`/compare/${stateId}/${constituency.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-600"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {constituency.name}
        </span>
        {constituency.number != null && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            #{constituency.number}
          </span>
        )}
      </div>
      {leader ? (
        <div className="mt-1.5 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <PartyChip party={leader.party} />
          <span className="truncate">{leader.name}</span>
        </div>
      ) : (
        <div className="mt-1.5 text-sm text-gray-400 dark:text-gray-500">
          Data coming soon
        </div>
      )}
    </Link>
  )
}

export default function ConstituencyListPage() {
  const { stateId = '' } = useParams()
  const stateEntry = AVAILABLE_STATES.find((s) => s.id === stateId)
  const stateName = stateEntry?.name ?? stateId ?? 'Unknown'

  const {
    data: summaries,
    loading,
    error,
  } = useAsync(
    () => candidateRepository.listConstituencySummaries(stateId),
    [stateId],
  )

  return (
    <div>
      <Link
        to="/"
        className="text-sm text-indigo-700 hover:underline dark:text-indigo-400"
      >
        ← All states
      </Link>

      <header className="mb-6 mt-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
          {stateName}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Tap any constituency to compare the candidates side by side.
        </p>
      </header>

      {loading && <StatusMessage title="Loading constituencies…" />}
      {error && (
        <StatusMessage
          title="Couldn’t load constituencies"
          detail={error.message}
        />
      )}

      {summaries &&
        groupByHouse(summaries).map((group) => (
          <section key={group.house} className="mt-8 first:mt-0">
            <h2 className="mb-3 flex items-baseline gap-2 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
              {group.house}
              <span className="text-gray-300 dark:text-gray-600">
                {group.items.length} seats
              </span>
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {group.items.map((summary) => (
                <li key={summary.constituency.id}>
                  <SummaryCard summary={summary} stateId={stateId} />
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}
