/**
 * REAL dataset — Odisha 2024 Legislative Assembly.
 * `affidavits.odisha2024.json`, 1,274 candidates, all 147 constituencies,
 * 143/147 winners flagged (Banki, Junagarh, Nimapara, Paradeep are genuine
 * source gaps — full rosters present, no winner attested).
 */

import affidavitData from './affidavits.odisha2024.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2024-06',
}

const ODISHA_PARTIES: Record<string, Party> = {
  bjd: { id: 'bjd', name: 'Biju Janata Dal', abbreviation: 'BJD', color: '#16a34a' },
}

const ODISHA_ALIASES: Record<string, string> = {
  bjd: 'bjd', bijujanatadal: 'bjd',
}

const resolveParty = createPartyResolver(ODISHA_PARTIES, ODISHA_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Odisha', house: 'Vidhan Sabha', electionYear: 2024, resolveParty, provenance: PROVENANCE },
)

export const ODISHA_CONSTITUENCIES = constituencies
export const ODISHA_CANDIDATES = candidates
