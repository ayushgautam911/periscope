/**
 * REAL dataset — Haryana 2024 Legislative Assembly.
 * `affidavits.haryana2024.json`, 1,027 candidates, all 90 constituencies,
 * every winner flagged, zero anomalies — third state (after Gujarat and
 * Madhya Pradesh) to come back perfectly clean.
 */

import affidavitData from './affidavits.haryana2024.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2024-10',
}

const HARYANA_PARTIES: Record<string, Party> = {
  jjp: { id: 'jjp', name: 'Jannayak Janta Party', abbreviation: 'JJP', color: '#059669' },
  inld: { id: 'inld', name: 'Indian National Lok Dal', abbreviation: 'INLD', color: '#16a34a' },
}

const HARYANA_ALIASES: Record<string, string> = {
  jjp: 'jjp', jannayakjantaparty: 'jjp',
  inld: 'inld', indiannationallokdal: 'inld',
}

const resolveParty = createPartyResolver(HARYANA_PARTIES, HARYANA_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Haryana', house: 'Vidhan Sabha', electionYear: 2024, resolveParty, provenance: PROVENANCE },
)

export const HARYANA_CONSTITUENCIES = constituencies
export const HARYANA_CANDIDATES = candidates
