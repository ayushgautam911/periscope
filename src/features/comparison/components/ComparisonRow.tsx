import {
  type ComparisonField,
  standoutCandidateIds,
} from '../../../domain/comparison'
import type { Candidate } from '../../../domain/types'

interface ComparisonRowProps {
  field: ComparisonField
  candidates: Candidate[]
  /** CSS grid template shared across header + every row so columns align. */
  gridTemplateColumns: string
}

/** One comparison criterion as a row: label cell + one cell per candidate. */
export default function ComparisonRow({
  field,
  candidates,
  gridTemplateColumns,
}: ComparisonRowProps) {
  const standouts = standoutCandidateIds(field, candidates)

  return (
    <div
      className="grid items-stretch border-t border-gray-100 dark:border-gray-800"
      style={{ gridTemplateColumns }}
    >
      {/* Sticky so row labels stay visible while candidate columns scroll. */}
      <div
        className="sticky left-0 z-10 border-r border-gray-100 bg-white px-3 py-3 text-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
        title={field.description}
      >
        {field.label}
      </div>

      {candidates.map((candidate) => {
        const detail = field.getDetail?.(candidate)
        const isStandout = standouts.has(candidate.id)
        return (
          <div
            key={candidate.id}
            className={`px-3 py-3 text-center ${
              isStandout ? 'bg-emerald-50 dark:bg-emerald-950/40' : ''
            }`}
          >
            <div
              className={`text-sm font-semibold ${
                isStandout
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {field.getDisplay(candidate)}
            </div>
            {detail && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {detail}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
