/**
 * REAL dataset — Punjab 2022 Legislative Assembly.
 * `affidavits.punjab2022.json`, 1,281 candidates, all 117 constituencies,
 * 116/117 winners flagged (Dina Nagar is a genuine source gap — full
 * roster present, no winner attested).
 */

import affidavitData from './affidavits.punjab2022.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2022-02',
}

const PUNJAB_PARTIES: Record<string, Party> = {
  sad: { id: 'sad', name: 'Shiromani Akali Dal', abbreviation: 'SAD', color: '#0891b2' },
  sada: { id: 'sada', name: 'Shiromani Akali Dal (Amritsar)', abbreviation: 'SAD(A)', color: '#f59e0b' },
  lip: { id: 'lip', name: 'Lok Insaaf Party', abbreviation: 'LIP', color: '#7c3aed' },
  plc: { id: 'plc', name: 'Punjab Lok Congress Party', abbreviation: 'PLC', color: '#dc2626' },
}

const PUNJAB_ALIASES: Record<string, string> = {
  sad: 'sad', shiromaniakalidal: 'sad',
  sada: 'sada', shiromaniakalidalamritsar: 'sada', shiromaniakalidalamritsarsimranjitsinghmann: 'sada',
  lip: 'lip', lokinsaafparty: 'lip',
  plc: 'plc', punjablokcongressparty: 'plc',
}

const resolveParty = createPartyResolver(PUNJAB_PARTIES, PUNJAB_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Punjab', house: 'Vidhan Sabha', electionYear: 2022, resolveParty, provenance: PROVENANCE },
)

export const PUNJAB_CONSTITUENCIES = constituencies
export const PUNJAB_CANDIDATES = candidates
