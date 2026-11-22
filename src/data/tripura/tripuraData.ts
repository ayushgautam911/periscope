/**
 * REAL dataset — Tripura 2023 Legislative Assembly.
 * `affidavits.tripura2023.json`, 254 candidates, all 60 constituencies.
 */

import affidavitData from './affidavits.tripura2023.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2023-02',
}

const TRIPURA_PARTIES: Record<string, Party> = {
  tipra: { id: 'tipra', name: 'Tipra Motha Party', abbreviation: 'TIPRA', color: '#7c3aed' },
  ipft: { id: 'ipft', name: 'Indigenous Peoples Front of Tripura', abbreviation: 'IPFT', color: '#059669' },
}

const TRIPURA_ALIASES: Record<string, string> = {
  tipra: 'tipra', tipramothaparty: 'tipra',
  ipft: 'ipft', indigenouspeoplesfrontoftripura: 'ipft',
}

const resolveParty = createPartyResolver(TRIPURA_PARTIES, TRIPURA_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Tripura', house: 'Vidhan Sabha', electionYear: 2023, resolveParty, provenance: PROVENANCE },
)

export const TRIPURA_CONSTITUENCIES = constituencies
export const TRIPURA_CANDIDATES = candidates
