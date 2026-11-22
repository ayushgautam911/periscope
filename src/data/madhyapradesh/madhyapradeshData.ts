/**
 * REAL dataset — Madhya Pradesh 2023 Legislative Assembly.
 * `affidavits.madhyapradesh2023.json`, 2,534 candidates, all 230
 * constituencies, every seat's winner flagged. Cleanest scrape yet —
 * zero anomalies (matches Gujarat's zero-anomaly run).
 */

import affidavitData from './affidavits.madhyapradesh2023.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2023-11',
}

const MP_PARTIES: Record<string, Party> = {
  asp: { id: 'asp', name: 'Aazad Samaj Party (Kanshi Ram)', abbreviation: 'ASP', color: '#2563eb' },
  ggp: { id: 'ggp', name: 'Gondvana Gantantra Party', abbreviation: 'GGP', color: '#16a34a' },
}

const MP_ALIASES: Record<string, string> = {
  asp: 'asp', aazadsamajpartykanshiram: 'asp', aazadsamajparty: 'asp',
  ggp: 'ggp', gondvanagantantraparty: 'ggp',
}

const resolveParty = createPartyResolver(MP_PARTIES, MP_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Madhya Pradesh', house: 'Vidhan Sabha', electionYear: 2023, resolveParty, provenance: PROVENANCE },
)

export const MADHYAPRADESH_CONSTITUENCIES = constituencies
export const MADHYAPRADESH_CANDIDATES = candidates
