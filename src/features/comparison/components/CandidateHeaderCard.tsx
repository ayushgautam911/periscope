import type { Candidate } from '../../../domain/types'
import PartyChip from '../../../components/PartyChip'

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function OutcomeTag({ candidate }: { candidate: Candidate }) {
  if (candidate.outcome === 'won') {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:bg-emerald-950/50 dark:text-emerald-400">
        Won
      </span>
    )
  }
  if (candidate.outcome === 'runner_up') {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-gray-800 dark:text-gray-400">
        Runner-up
      </span>
    )
  }
  return null
}

/** Compact identity card shown at the top of each candidate column. */
export default function CandidateHeaderCard({
  candidate,
}: {
  candidate: Candidate
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-2 py-3 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: candidate.party.color ?? '#6b7280' }}
        aria-hidden="true"
      >
        {initials(candidate.name)}
      </div>
      <div className="text-sm leading-tight font-semibold text-gray-900 dark:text-gray-100">
        {candidate.name}
      </div>
      <PartyChip party={candidate.party} />
      <OutcomeTag candidate={candidate} />
      {candidate.profession && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {candidate.profession}
        </div>
      )}
    </div>
  )
}
