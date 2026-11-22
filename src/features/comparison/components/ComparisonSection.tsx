import { useState } from 'react'
import {
  type ComparisonCategory,
  fieldsForCategory,
} from '../../../domain/comparison'
import type { Candidate } from '../../../domain/types'
import { CaseDetailRow } from './CaseDetails'
import ComparisonRow from './ComparisonRow'

interface ComparisonSectionProps {
  category: ComparisonCategory
  candidates: Candidate[]
  gridTemplateColumns: string
}

/** A titled group of comparison rows for one category. */
export default function ComparisonSection({
  category,
  candidates,
  gridTemplateColumns,
}: ComparisonSectionProps) {
  const fields = fieldsForCategory(category)
  const [showCases, setShowCases] = useState(false)
  const hasCaseDetail = candidates.some((c) => c.criminalRecord?.cases?.length)

  return (
    <section className="mt-6 first:mt-0">
      {/* Sticky-left so the title doesn't scroll away with the columns. */}
      <h2 className="sticky left-0 w-fit px-3 pb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
        {category}
      </h2>
      {/* overflow-clip (not -hidden) keeps the rounded corners without creating
          a scroll box, which would break the sticky label column inside. */}
      <div className="overflow-clip rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {fields.map((field) => (
          <div key={field.id}>
            <ComparisonRow
              field={field}
              candidates={candidates}
              gridTemplateColumns={gridTemplateColumns}
            />
            {field.id === 'criminalCases' && hasCaseDetail && (
              <>
                <button
                  onClick={() => setShowCases((v) => !v)}
                  className="w-full border-t border-gray-100 px-3 py-2 text-left hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <span className="sticky left-0 flex w-fit items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    <span
                      className="inline-block transition-transform duration-150"
                      style={{ transform: showCases ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      ▸
                    </span>
                    {showCases ? 'Hide charges' : 'See what the cases are about'}
                  </span>
                </button>
                {showCases && (
                  <CaseDetailRow
                    candidates={candidates}
                    gridTemplateColumns={gridTemplateColumns}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
