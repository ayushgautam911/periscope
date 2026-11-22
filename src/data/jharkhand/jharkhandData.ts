/**
 * REAL dataset — Jharkhand 2024 Legislative Assembly.
 * `affidavits.jharkhand2024.json`, 1,193 candidates, all 81 constituencies,
 * 80/81 winners flagged (Bermo is a genuine source gap — full roster
 * present, no winner attested).
 */

import affidavitData from './affidavits.jharkhand2024.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2024-11',
}

const JHARKHAND_PARTIES: Record<string, Party> = {
  jmm: { id: 'jmm', name: 'Jharkhand Mukti Morcha', abbreviation: 'JMM', color: '#16a34a' },
  jlkm: { id: 'jlkm', name: 'Jharkhand Loktantrik Krantikari Morcha', abbreviation: 'JLKM', color: '#dc2626' },
  bap: { id: 'bap', name: 'Bharat Adivasi Party', abbreviation: 'BAP', color: '#f59e0b' },
}

const JHARKHAND_ALIASES: Record<string, string> = {
  jmm: 'jmm', jharkhandmuktimorcha: 'jmm',
  jlkm: 'jlkm', jharkhandloktantrikkrantikarimorcha: 'jlkm',
  bap: 'bap', bharatadivasiparty: 'bap',
}

const resolveParty = createPartyResolver(JHARKHAND_PARTIES, JHARKHAND_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Jharkhand', house: 'Vidhan Sabha', electionYear: 2024, resolveParty, provenance: PROVENANCE },
)

export const JHARKHAND_CONSTITUENCIES = constituencies
export const JHARKHAND_CANDIDATES = candidates
