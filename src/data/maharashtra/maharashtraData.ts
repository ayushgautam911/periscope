/**
 * REAL dataset — Maharashtra 2019 Legislative Assembly.
 *
 * `affidavits.maharashtra2019.json`, 3,139 candidates, all 288 constituencies.
 * The scraper's title parser originally dropped directional qualifiers
 * ("(CENTRAL)", "(WEST)", "(OUTER)") that several Maharashtra cities use to
 * distinguish real, separate seats — Aurangabad Central/West and Malegaon
 * Central/Outer collapsed into one merged roster each with two conflicting
 * winners. Fixed in `wayback.py parse_header`: a paren group before the
 * district is now kept as part of the seat name unless it's the district
 * itself or a reservation tag (SC/ST). Re-scraped from cache; verified
 * 288/288 distinct seats, zero duplicate winners.
 */

import affidavitData from './affidavits.maharashtra2019.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2019-10',
}

const MAHARASHTRA_PARTIES: Record<string, Party> = {
  vba: { id: 'vba', name: 'Vanchit Bahujan Aaghadi', abbreviation: 'VBA', color: '#0891b2' },
  shs: { id: 'shs', name: 'Shiv Sena', abbreviation: 'SHS', color: '#ea580c' },
  mns: { id: 'mns', name: 'Maharashtra Navnirman Sena', abbreviation: 'MNS', color: '#7c3aed' },
  bmp: { id: 'bmp', name: 'Bahujan Mukti Party', abbreviation: 'BMP', color: '#16a34a' },
  sbp: { id: 'sbp', name: 'Sambhaji Brigade Party', abbreviation: 'SBP', color: '#dc2626' },
  bva: { id: 'bva', name: 'Bahujan Vikas Aaghadi', abbreviation: 'BVA', color: '#059669' },
  pjp: { id: 'pjp', name: 'Prahar Janshakti Party', abbreviation: 'PJP', color: '#f59e0b' },
}

const MAHARASHTRA_ALIASES: Record<string, string> = {
  vba: 'vba', vanchitbahujanaaghadi: 'vba',
  shs: 'shs', shivsena: 'shs',
  mns: 'mns', maharashtranavnirmansena: 'mns',
  bmp: 'bmp', bahujanmuktiparty: 'bmp',
  sbp: 'sbp', sambhajibrigadeparty: 'sbp',
  bva: 'bva', bahujanvikasaaghadi: 'bva',
  pjp: 'pjp', praharjanshaktiparty: 'pjp',
}

const resolveParty = createPartyResolver(MAHARASHTRA_PARTIES, MAHARASHTRA_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Maharashtra', house: 'Vidhan Sabha', electionYear: 2019, resolveParty, provenance: PROVENANCE },
)

export const MAHARASHTRA_CONSTITUENCIES = constituencies
export const MAHARASHTRA_CANDIDATES = candidates
