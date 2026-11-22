/**
 * REAL dataset — Uttar Pradesh 2022 Vidhan Sabha.
 *
 * Built entirely from the scraped Form 26 affidavit roster
 * (`affidavits.up2022.json`, 4,404 candidates, all 403 constituencies).
 * The copy step already excludes the 9 post-2022 bye-elections and keeps the
 * general-election winner where a seat later changed hands (Duddhi). Winner
 * flags come from the scrape (`is_winner`); vote counts are not included.
 */

import affidavitData from './affidavits.up2022.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2022-03',
}

const UP_PARTIES: Record<string, Party> = {
  sp: { id: 'sp', name: 'Samajwadi Party', abbreviation: 'SP', color: '#dc2626' },
  rld: { id: 'rld', name: 'Rashtriya Lok Dal', abbreviation: 'RLD', color: '#16a34a' },
  adal: { id: 'adal', name: 'Apna Dal (Soneylal)', abbreviation: 'AD(S)', color: '#0891b2' },
  sbsp: { id: 'sbsp', name: 'Suheldev Bharatiya Samaj Party', abbreviation: 'SBSP', color: '#ca8a04' },
  nishad: { id: 'nishad', name: 'NISHAD Party', abbreviation: 'NISHAD', color: '#7c3aed' },
  asp: { id: 'asp', name: 'Aazad Samaj Party (Kanshi Ram)', abbreviation: 'ASP', color: '#2563eb' },
  aimim: { id: 'aimim', name: 'All India Majlis-E-Ittehadul Muslimeen', abbreviation: 'AIMIM', color: '#047857' },
}

const UP_ALIASES: Record<string, string> = {
  sp: 'sp', samajwadiparty: 'sp',
  rld: 'rld', rashtriyalokdal: 'rld',
  adal: 'adal', ads: 'adal', apnadalsoneylal: 'adal', apnadalsonelal: 'adal',
  sbsp: 'sbsp', suheldevbharatiyasamajparty: 'sbsp',
  nishad: 'nishad', nishadparty: 'nishad',
  asp: 'asp', aazadsamajpartykanshiram: 'asp', aazadsamajparty: 'asp',
  aimim: 'aimim', allindiamajliseittehadulmuslimeen: 'aimim',
}

const resolveParty = createPartyResolver(UP_PARTIES, UP_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  {
    state: 'Uttar Pradesh',
    house: 'Vidhan Sabha',
    electionYear: 2022,
    resolveParty,
    provenance: PROVENANCE,
  },
)

export const UP_CONSTITUENCIES = constituencies
export const UP_CANDIDATES = candidates
