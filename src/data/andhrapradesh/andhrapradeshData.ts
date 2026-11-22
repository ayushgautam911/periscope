/**
 * REAL dataset — Andhra Pradesh 2024 Legislative Assembly.
 * `affidavits.andhrapradesh2024.json`, 2,352 candidates, all 175
 * constituencies, 174/175 winners flagged (Puttaparthi is a genuine source
 * gap — full roster present, no winner attested).
 */

import affidavitData from './affidavits.andhrapradesh2024.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2024-05',
}

const AP_PARTIES: Record<string, Party> = {
  ysrcp: { id: 'ysrcp', name: 'Yuvajana Sramika Rythu Congress Party', abbreviation: 'YSRCP', color: '#0891b2' },
  tdp: { id: 'tdp', name: 'Telugu Desam Party', abbreviation: 'TDP', color: '#facc15' },
  jsp: { id: 'jsp', name: 'Janasena Party', abbreviation: 'JSP', color: '#dc2626' },
}

const AP_ALIASES: Record<string, string> = {
  ysrcp: 'ysrcp', yuvajanasramikarythucongressparty: 'ysrcp',
  tdp: 'tdp', telugudesamparty: 'tdp',
  jsp: 'jsp', janasenaparty: 'jsp',
}

const resolveParty = createPartyResolver(AP_PARTIES, AP_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Andhra Pradesh', house: 'Vidhan Sabha', electionYear: 2024, resolveParty, provenance: PROVENANCE },
)

export const ANDHRAPRADESH_CONSTITUENCIES = constituencies
export const ANDHRAPRADESH_CANDIDATES = candidates
