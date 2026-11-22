/**
 * REAL dataset — Mizoram 2023 Legislative Assembly.
 * `affidavits.mizoram2023.json`, 168 candidates, all 40 constituencies.
 */

import affidavitData from './affidavits.mizoram2023.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2023-11',
}

const MIZORAM_PARTIES: Record<string, Party> = {
  mnf: { id: 'mnf', name: 'Mizo National Front', abbreviation: 'MNF', color: '#f59e0b' },
  zpm: { id: 'zpm', name: "Zoram People's Movement", abbreviation: 'ZPM', color: '#0891b2' },
  mpc: { id: 'mpc', name: 'Mizoram Peoples Conference', abbreviation: 'MPC', color: '#7c3aed' },
}

const MIZORAM_ALIASES: Record<string, string> = {
  mnf: 'mnf', mizonationalfront: 'mnf',
  // Both smart- and straight-apostrophe forms appear in the source.
  zpm: 'zpm', zorampeoplesmovement: 'zpm',
  mpc: 'mpc', mizorampeoplesconference: 'mpc',
}

const resolveParty = createPartyResolver(MIZORAM_PARTIES, MIZORAM_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Mizoram', house: 'Vidhan Sabha', electionYear: 2023, resolveParty, provenance: PROVENANCE },
)

export const MIZORAM_CONSTITUENCIES = constituencies
export const MIZORAM_CANDIDATES = candidates
