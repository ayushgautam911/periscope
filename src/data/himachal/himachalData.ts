/**
 * REAL dataset — Himachal Pradesh 2022 Legislative Assembly.
 *
 * `affidavits.himachal2022.json`, 413 candidates, all 68 constituencies.
 * The source itself gives conflicting winner claims for Lahaul & Spiti
 * (two spelling variants of the same seat, filed under different candidate
 * IDs, both flagged as winners on the archived winners page). Merged to one
 * seat + deduped by candidate at copy time; that seat carries no winner
 * badge since we won't guess between two source-asserted winners.
 */

import affidavitData from './affidavits.himachal2022.json'
import type { DataProvenance } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2022-12',
}

// No regional parties beyond the national registry carry real weight here.
const resolveParty = createPartyResolver()

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Himachal Pradesh', house: 'Vidhan Sabha', electionYear: 2022, resolveParty, provenance: PROVENANCE },
)

export const HIMACHAL_CONSTITUENCIES = constituencies
export const HIMACHAL_CANDIDATES = candidates
