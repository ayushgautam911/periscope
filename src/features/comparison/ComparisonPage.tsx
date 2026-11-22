import { Link, useParams } from 'react-router-dom'
import { COMPARISON_CATEGORIES } from '../../domain/comparison'
import StatusMessage from '../../components/StatusMessage'
import CandidateHeaderCard from './components/CandidateHeaderCard'
import ComparisonSection from './components/ComparisonSection'
import { useComparison } from './useComparison'

export default function ComparisonPage() {
  const { stateId = '', constituencyId = '' } = useParams()
  const { data, loading, error } = useComparison(stateId, constituencyId)

  if (loading) return <StatusMessage title="Loading candidates..." />
  if (error) {
    return (
      <StatusMessage title="Could not load this race" detail={error.message} />
    )
  }

  const constituency = data?.constituency
  const candidates = data?.candidates ?? []

  if (!constituency) {
    return (
      <div>
        <StatusMessage
          title="Constituency not found"
          detail="It may have been removed or the link is wrong."
        />
        <div className="text-center">
          <Link
            to="/"
            className="text-indigo-700 hover:underline dark:text-indigo-400"
          >
            &larr; All states
          </Link>
        </div>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <StatusMessage
        title={`${constituency.name} — data coming soon`}
        detail="We're still gathering candidate details for this constituency. Please check back shortly."
      />
    )
  }

  // Label column + one column per candidate. clamp() narrows both on phones
  // (a 380px screen fits the labels plus ~1.5 candidate columns) while keeping
  // the roomy desktop widths.
  const gridTemplateColumns = `clamp(6.5rem, 30vw, 12rem) repeat(${candidates.length}, clamp(8.75rem, 42vw, 11rem))`

  return (
    <div>
      <Link
        to={`/state/${stateId}`}
        className="text-sm text-indigo-700 hover:underline dark:text-indigo-400"
      >
        &larr; All constituencies
      </Link>

      <header className="mt-3 mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {constituency.name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {constituency.house} &middot; {constituency.state} &middot; {constituency.electionYear}
        </p>
        {candidates.length > 2 && (
          <p className="mt-1 text-xs text-gray-400 sm:hidden dark:text-gray-500">
            Swipe sideways to see all {candidates.length} candidates &rarr;
          </p>
        )}
      </header>

      <div className="overflow-x-auto">
        <div className="w-max min-w-full">
          <div className="grid" style={{ gridTemplateColumns }}>
            {/* Sticky spacer above the sticky label column. */}
            <div className="sticky left-0 z-10 bg-white dark:bg-[#0b1120]" />
            {candidates.map((candidate) => (
              <CandidateHeaderCard key={candidate.id} candidate={candidate} />
            ))}
          </div>

          {COMPARISON_CATEGORIES.map((category) => (
            <ComparisonSection
              key={category}
              category={category}
              candidates={candidates}
              gridTemplateColumns={gridTemplateColumns}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        &ldquo;&mdash;&rdquo; means data not available.
      </p>
    </div>
  )
}
