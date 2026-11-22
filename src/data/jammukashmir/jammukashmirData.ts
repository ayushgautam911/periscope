/**
 * REAL dataset — Jammu & Kashmir 2024 Legislative Assembly.
 *
 * A Union Territory, not a state — but the only UT besides Delhi and
 * Puducherry with its own elected assembly, so it's included for complete
 * national assembly-election coverage. `affidavits.jandk2024.json`, 872
 * candidates, all 90 constituencies, every winner flagged — fifth state
 * (after Gujarat/Madhya Pradesh/Haryana/Assam) to come back perfectly
 * clean.
 */

import affidavitData from './affidavits.jandk2024.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2024-09',
}

const JANDK_PARTIES: Record<string, Party> = {
  jkpdp: { id: 'jkpdp', name: 'Jammu & Kashmir Peoples Democratic Party', abbreviation: 'PDP', color: '#059669' },
  jknc: { id: 'jknc', name: 'Jammu & Kashmir National Conference', abbreviation: 'JKNC', color: '#dc2626' },
  jkap: { id: 'jkap', name: 'Jammu and Kashmir Apni Party', abbreviation: 'JKAP', color: '#0891b2' },
  dpap: { id: 'dpap', name: 'Democratic Progressive Azad Party', abbreviation: 'DPAP', color: '#7c3aed' },
  jkpc: { id: 'jkpc', name: 'Jammu & Kashmir People Conference', abbreviation: 'JKPC', color: '#f59e0b' },
}

const JANDK_ALIASES: Record<string, string> = {
  jkpdp: 'jkpdp', jammukashmirpeoplesdemocraticparty: 'jkpdp',
  jknc: 'jknc', jammukashmirnationalconference: 'jknc',
  jkap: 'jkap', jammuandkashmirapniparty: 'jkap',
  dpap: 'dpap', democraticprogressiveazadparty: 'dpap',
  jkpc: 'jkpc', jammukashmirpeopleconference: 'jkpc',
}

const resolveParty = createPartyResolver(JANDK_PARTIES, JANDK_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Jammu and Kashmir', house: 'Vidhan Sabha', electionYear: 2024, resolveParty, provenance: PROVENANCE },
)

export const JANDK_CONSTITUENCIES = constituencies
export const JANDK_CANDIDATES = candidates
