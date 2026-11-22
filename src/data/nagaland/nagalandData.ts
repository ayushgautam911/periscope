/**
 * REAL dataset — Nagaland 2023 Legislative Assembly.
 * `affidavits.nagaland2023.json`, 184 candidates, all 60 constituencies.
 */

import affidavitData from './affidavits.nagaland2023.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2023-02',
}

const NAGALAND_PARTIES: Record<string, Party> = {
  ndpp: { id: 'ndpp', name: 'National Democratic Progressive Party', abbreviation: 'NDPP', color: '#059669' },
  npf: { id: 'npf', name: 'Naga People\'s Front', abbreviation: 'NPF', color: '#dc2626' },
  npp: { id: 'npp', name: "National People's Party", abbreviation: 'NPP', color: '#0ea5e9' },
}

const NAGALAND_ALIASES: Record<string, string> = {
  ndpp: 'ndpp', nationaldemocraticprogressiveparty: 'ndpp',
  npf: 'npf', nagapeoplesfront: 'npf',
  npp: 'npp', nationalpeoplesparty: 'npp',
}

const resolveParty = createPartyResolver(NAGALAND_PARTIES, NAGALAND_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Nagaland', house: 'Vidhan Sabha', electionYear: 2023, resolveParty, provenance: PROVENANCE },
)

export const NAGALAND_CONSTITUENCIES = constituencies
export const NAGALAND_CANDIDATES = candidates
