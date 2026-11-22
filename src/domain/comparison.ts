/**
 * The comparison engine, expressed as data.
 *
 * Every dimension voters can compare is a `ComparisonField` entry here — so
 * adding, removing, or reordering a criterion is a one-line config change, with
 * no edits to any component. The UI iterates these fields generically.
 *
 * Fields tolerate MISSING data: `getMetric` returns `null` and `getDisplay`
 * returns the "not available" dash when a candidate lacks that field. This lets
 * the same UI show real election results (party, votes, outcome) today and
 * affidavit details (cases, assets) once a source for them is wired in.
 */

import { type Candidate, netWorth } from './types'
import { educationRank } from './education'
import { formatAge, formatINR, pluralize } from './format'

export type ComparisonCategory =
  | 'This election'
  | 'Integrity & Record'
  | 'Background'

export const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  'This election',
  'Integrity & Record',
  'Background',
]

/** Shown when a candidate has no value for a field — never invented. */
export const NOT_AVAILABLE = '—'

/**
 * When candidates differ on a field, which value should visually "stand out"?
 * This drives neutral, subtle highlighting — never a verdict.
 */
export type Emphasis = 'lowerStandsOut' | 'higherStandsOut' | 'none'

export interface ComparisonField {
  id: string
  label: string
  category: ComparisonCategory
  /** Numeric basis for ordering/emphasis. `null` means "not available". */
  getMetric: (c: Candidate) => number | null
  /** Primary human-readable cell value. */
  getDisplay: (c: Candidate) => string
  /** Optional second line (e.g. "2 serious cases"). */
  getDetail?: (c: Candidate) => string | null
  emphasis: Emphasis
  /** Plain-language note to help a voter interpret the field. */
  description?: string
}

const OUTCOME_RANK: Record<string, number> = {
  won: 2,
  runner_up: 1,
  contested: 0,
}

const OUTCOME_LABEL: Record<string, string> = {
  won: 'Won',
  runner_up: 'Runner-up',
  contested: 'Contested',
}

export const COMPARISON_FIELDS: ComparisonField[] = [
  // ── This election (from results — usually available) ──
  {
    id: 'outcome',
    label: 'Result',
    category: 'This election',
    getMetric: (c) => (c.outcome ? OUTCOME_RANK[c.outcome] : null),
    getDisplay: (c) => (c.outcome ? OUTCOME_LABEL[c.outcome] : NOT_AVAILABLE),
    emphasis: 'higherStandsOut',
    description: 'How the candidate placed in this election.',
  },
  {
    id: 'votes',
    label: 'Votes',
    category: 'This election',
    getMetric: (c) => c.votes ?? null,
    getDisplay: (c) =>
      c.votes != null ? c.votes.toLocaleString('en-IN') : NOT_AVAILABLE,
    emphasis: 'higherStandsOut',
    description: 'Total votes polled for the candidate.',
  },
  {
    id: 'voteShare',
    label: 'Vote share',
    category: 'This election',
    getMetric: (c) => c.voteSharePct ?? null,
    getDisplay: (c) =>
      c.voteSharePct != null ? `${c.voteSharePct.toFixed(2)}%` : NOT_AVAILABLE,
    emphasis: 'higherStandsOut',
    description: 'Share of valid votes the candidate received.',
  },

  // ── Integrity & Record (from affidavits — not yet sourced) ──
  {
    id: 'criminalCases',
    label: 'Criminal cases',
    category: 'Integrity & Record',
    getMetric: (c) => c.criminalRecord?.totalCases ?? null,
    getDisplay: (c) =>
      c.criminalRecord
        ? pluralize(c.criminalRecord.totalCases, 'case')
        : NOT_AVAILABLE,
    getDetail: (c) => {
      if (!c.criminalRecord) return null
      if (c.criminalRecord.seriousCases > 0)
        return `${c.criminalRecord.seriousCases} serious`
      return c.criminalRecord.totalCases > 0 ? 'None serious' : null
    },
    emphasis: 'lowerStandsOut',
    description:
      'Pending criminal cases declared in the candidate’s election affidavit. Fewer is highlighted.',
  },
  {
    id: 'totalAssets',
    label: 'Total assets',
    category: 'Integrity & Record',
    getMetric: (c) => c.finances?.totalAssets ?? null,
    getDisplay: (c) =>
      c.finances ? formatINR(c.finances.totalAssets) : NOT_AVAILABLE,
    emphasis: 'none',
    description: 'Self-declared movable + immovable assets.',
  },
  {
    id: 'totalLiabilities',
    label: 'Liabilities',
    category: 'Integrity & Record',
    getMetric: (c) => c.finances?.totalLiabilities ?? null,
    getDisplay: (c) =>
      c.finances?.totalLiabilities != null
        ? formatINR(c.finances.totalLiabilities)
        : NOT_AVAILABLE,
    emphasis: 'none',
    description: 'Self-declared loans and dues.',
  },
  {
    id: 'netWorth',
    label: 'Net worth',
    category: 'Integrity & Record',
    getMetric: (c) => (c.finances ? netWorth(c.finances) : null),
    getDisplay: (c) => {
      const nw = c.finances ? netWorth(c.finances) : null
      return nw != null ? formatINR(nw) : NOT_AVAILABLE
    },
    emphasis: 'none',
    description: 'Assets minus liabilities (derived).',
  },

  // ── Background (from affidavits — not yet sourced) ──
  {
    id: 'age',
    label: 'Age',
    category: 'Background',
    getMetric: (c) => c.age ?? null,
    getDisplay: (c) => (c.age != null ? formatAge(c.age) : NOT_AVAILABLE),
    emphasis: 'none',
  },
  {
    id: 'education',
    label: 'Education',
    category: 'Background',
    getMetric: (c) => (c.education ? educationRank(c.education) : null),
    getDisplay: (c) => c.education ?? NOT_AVAILABLE,
    emphasis: 'higherStandsOut',
    description: 'Highest qualification declared. More formal is highlighted.',
  },
  {
    id: 'profession',
    label: 'Profession',
    category: 'Background',
    getMetric: () => null,
    getDisplay: (c) => c.profession ?? NOT_AVAILABLE,
    emphasis: 'none',
  },
]

/** Fields belonging to a category, in declared order. */
export function fieldsForCategory(
  category: ComparisonCategory,
): ComparisonField[] {
  return COMPARISON_FIELDS.filter((f) => f.category === category)
}

/**
 * Given a field and the candidates being compared, return the set of candidate
 * ids whose value "stands out" per the field's emphasis. Returns an empty set
 * when emphasis is 'none', fewer than two values exist, or everyone ties.
 */
export function standoutCandidateIds(
  field: ComparisonField,
  candidates: Candidate[],
): Set<string> {
  if (field.emphasis === 'none') return new Set()

  const metrics = candidates
    .map((c) => ({ id: c.id, metric: field.getMetric(c) }))
    .filter((m): m is { id: string; metric: number } => m.metric !== null)

  if (metrics.length < 2) return new Set()

  const values = metrics.map((m) => m.metric)
  const target =
    field.emphasis === 'lowerStandsOut'
      ? Math.min(...values)
      : Math.max(...values)

  // Don't highlight when everyone is equal — there's no meaningful difference.
  if (values.every((v) => v === target)) return new Set()

  return new Set(metrics.filter((m) => m.metric === target).map((m) => m.id))
}
