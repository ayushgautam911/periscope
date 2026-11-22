import type { Candidate, CriminalCase } from '../../../domain/types'
import { ipcMeaning } from '../../../domain/ipc'

/**
 * The expandable "what charges are on record" row that appears INSIDE the
 * comparison table, directly under the Criminal cases row — one cell per
 * candidate, aligned to their column. Charges are shown in plain language for
 * ordinary voters, with the IPC number as a small secondary tag, and the case
 * status in everyday words ("Found guilty", "On trial", "Case filed").
 */
export function CaseDetailRow({
  candidates,
  gridTemplateColumns,
}: {
  candidates: Candidate[]
  gridTemplateColumns: string
}) {
  return (
    <div
      className="grid items-start border-t border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/30"
      style={{ gridTemplateColumns }}
    >
      <div className="sticky left-0 z-10 border-r border-gray-100 bg-gray-50 px-3 py-3 text-xs font-medium text-gray-400 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-500">
        Charges on record
      </div>
      {candidates.map((candidate) => {
        const cases = candidate.criminalRecord?.cases ?? []
        return (
          <div
            key={candidate.id}
            className="space-y-2 border-l border-gray-100 px-2 py-3 dark:border-gray-800"
          >
            {cases.length > 0 ? (
              cases.map((c, i) => <CaseMini key={i} index={i} c={c} />)
            ) : (
              <div className="text-center text-xs text-gray-300 dark:text-gray-600">
                —
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function CaseMini({ index, c }: { index: number; c: CriminalCase }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-2 text-left dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-1.5 flex flex-wrap items-center gap-1">
        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
          Case {index + 1}
        </span>
        <StatusBadge c={c} />
      </div>
      {c.sections.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {c.sections.map((s) => (
            <ChargeChip key={s} section={s} />
          ))}
        </div>
      )}
      {c.otherActs && (
        <div className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="text-gray-400 dark:text-gray-500">Other laws: </span>
          {c.otherActs}
        </div>
      )}
      {c.punishment && (
        <div className="mt-1.5 text-[11px] font-medium text-rose-700 dark:text-rose-400">
          Sentence: {c.punishment}
        </div>
      )}
      {c.court && (
        <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
          {c.court}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ c }: { c: CriminalCase }) {
  if (c.status === 'convicted') {
    return (
      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
        Found guilty
      </span>
    )
  }
  if (c.chargesFramed) {
    return (
      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
        On trial
      </span>
    )
  }
  return (
    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      Case filed
    </span>
  )
}

function ChargeChip({ section }: { section: string }) {
  const meaning = ipcMeaning(section)
  return (
    <span
      title={meaning ? `IPC Section ${section}: ${meaning}` : `IPC Section ${section}`}
      className="inline-flex flex-wrap items-baseline gap-1 rounded bg-gray-100 px-1.5 py-1 text-[11px] leading-tight text-gray-700 dark:bg-gray-800 dark:text-gray-200"
    >
      <span className="font-medium">{meaning ?? `IPC ${section}`}</span>
      {meaning && (
        <span className="text-[9px] text-gray-400 dark:text-gray-500">
          IPC {section}
        </span>
      )}
    </span>
  )
}
