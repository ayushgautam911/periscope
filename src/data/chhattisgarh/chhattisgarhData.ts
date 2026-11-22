/**
 * REAL dataset — Chhattisgarh 2023 Legislative Assembly.
 * `affidavits.chhattisgarh2023.json`, 1,167 candidates, all 90
 * constituencies, 88/90 winners flagged (Chandrapur and Dondi Lohara are
 * genuine source gaps — full rosters present, no winner attested).
 */

import affidavitData from './affidavits.chhattisgarh2023.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2023-11',
}

const CG_PARTIES: Record<string, Party> = {
  jccj: { id: 'jccj', name: 'Janta Congress Chhattisgarh (J)', abbreviation: 'JCC(J)', color: '#f59e0b' },
  ggp: { id: 'ggp', name: 'Gondvana Gantantra Party', abbreviation: 'GGP', color: '#16a34a' },
}

const CG_ALIASES: Record<string, string> = {
  jccj: 'jccj', jantacongresschhattisgarhj: 'jccj',
  ggp: 'ggp', gondvanagantantraparty: 'ggp',
}

const resolveParty = createPartyResolver(CG_PARTIES, CG_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Chhattisgarh', house: 'Vidhan Sabha', electionYear: 2023, resolveParty, provenance: PROVENANCE },
)

export const CHHATTISGARH_CONSTITUENCIES = constituencies
export const CHHATTISGARH_CANDIDATES = candidates
