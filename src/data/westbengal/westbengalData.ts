/**
 * REAL dataset — West Bengal 2021 Legislative Assembly.
 * `affidavits.westbengal2021.json`, 2,125 candidates, all 294 constituencies.
 * 292/294 winners flagged — Jangipur and Samserganj have full rosters but no
 * winner attested in the source; we never guess.
 */

import affidavitData from './affidavits.westbengal2021.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2021-05',
}

const WESTBENGAL_PARTIES: Record<string, Party> = {
  aitc: { id: 'aitc', name: 'All India Trinamool Congress', abbreviation: 'AITC', color: '#059669' },
  aifb: { id: 'aifb', name: 'All India Forward Bloc', abbreviation: 'AIFB', color: '#dc2626' },
  ab: { id: 'ab', name: 'Amra Bangalee', abbreviation: 'AB', color: '#f59e0b' },
  rsmp: { id: 'rsmp', name: 'Rashtriya Secular Majlis Party', abbreviation: 'RSMP', color: '#0891b2' },
  kppu: { id: 'kppu', name: 'Kamatapur Peoples Party (United)', abbreviation: 'KPP(U)', color: '#7c3aed' },
  pm: { id: 'pm', name: 'Purvanchal Mahapanchayat', abbreviation: 'PM', color: '#16a34a' },
}

const WESTBENGAL_ALIASES: Record<string, string> = {
  aitc: 'aitc', allindiatrinamoolcongress: 'aitc',
  aifb: 'aifb', allindiaforwardbloc: 'aifb',
  ab: 'ab', amrabangalee: 'ab',
  rsmp: 'rsmp', rashtriyasecularmajlisparty: 'rsmp',
  kppu: 'kppu', kamatapurpeoplespartyunited: 'kppu',
  pm: 'pm', purvanchalmahapanchayat: 'pm',
}

const resolveParty = createPartyResolver(WESTBENGAL_PARTIES, WESTBENGAL_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'West Bengal', house: 'Vidhan Sabha', electionYear: 2021, resolveParty, provenance: PROVENANCE },
)

export const WESTBENGAL_CONSTITUENCIES = constituencies
export const WESTBENGAL_CANDIDATES = candidates
