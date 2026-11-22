/**
 * The data-access boundary.
 *
 * The whole app depends only on this interface, never on a concrete source.
 * Swapping data sources (bundled JSON ↔ a future API) means implementing this
 * contract and changing one line in `src/data/index.ts`.
 *
 * Every method is scoped to a state so implementations can load one state's
 * dataset at a time (code-split bundles today, per-state API calls tomorrow).
 */

import type { Candidate, Constituency } from '../domain/types'

/** A constituency paired with its elected leader (winner), when known. */
export interface ConstituencySummary {
  constituency: Constituency
  leader?: Candidate
}

export interface CandidateRepository {
  /** Constituencies plus their elected leader — for a state's directory. */
  listConstituencySummaries(stateId: string): Promise<ConstituencySummary[]>
  getConstituency(
    stateId: string,
    constituencyId: string,
  ): Promise<Constituency | null>
  /** Candidates contesting a given constituency. */
  getCandidatesByConstituency(
    stateId: string,
    constituencyId: string,
  ): Promise<Candidate[]>
}
