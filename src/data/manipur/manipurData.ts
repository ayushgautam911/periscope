/**
 * REAL dataset — Manipur 2022 Legislative Assembly.
 * `affidavits.manipur2022.json`, 265 candidates, all 60 constituencies.
 */

import affidavitData from './affidavits.manipur2022.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2022-03',
}

const MANIPUR_PARTIES: Record<string, Party> = {
  npp: { id: 'npp', name: "National People's Party", abbreviation: 'NPP', color: '#0ea5e9' },
  npf: { id: 'npf', name: "Naga People's Front", abbreviation: 'NPF', color: '#dc2626' },
}

const MANIPUR_ALIASES: Record<string, string> = {
  npp: 'npp', nationalpeoplesparty: 'npp',
  npf: 'npf', nagapeoplesfront: 'npf',
}

const resolveParty = createPartyResolver(MANIPUR_PARTIES, MANIPUR_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Manipur', house: 'Vidhan Sabha', electionYear: 2022, resolveParty, provenance: PROVENANCE },
)

export const MANIPUR_CONSTITUENCIES = constituencies
export const MANIPUR_CANDIDATES = candidates
