/**
 * REAL dataset — Telangana 2023 Legislative Assembly.
 * `affidavits.telangana2023.json`, 2,216 candidates, all 119 constituencies,
 * 118/119 winners flagged (Nagarkurnool is a genuine source gap — full
 * roster present, no winner attested).
 */

import affidavitData from './affidavits.telangana2023.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2023-11',
}

const TELANGANA_PARTIES: Record<string, Party> = {
  brs: { id: 'brs', name: 'Bharat Rashtra Samithi', abbreviation: 'BRS', color: '#ea580c' },
}

const TELANGANA_ALIASES: Record<string, string> = {
  brs: 'brs', bharatrashtrasamithi: 'brs',
}

const resolveParty = createPartyResolver(TELANGANA_PARTIES, TELANGANA_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Telangana', house: 'Vidhan Sabha', electionYear: 2023, resolveParty, provenance: PROVENANCE },
)

export const TELANGANA_CONSTITUENCIES = constituencies
export const TELANGANA_CANDIDATES = candidates
