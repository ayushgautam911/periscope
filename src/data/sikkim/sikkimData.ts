/**
 * REAL dataset — Sikkim 2024 Legislative Assembly.
 * `affidavits.sikkim2024.json`, 137 candidates, all 32 constituencies.
 */

import affidavitData from './affidavits.sikkim2024.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2024-04',
}

const SIKKIM_PARTIES: Record<string, Party> = {
  skm: { id: 'skm', name: 'Sikkim Krantikari Morcha', abbreviation: 'SKM', color: '#f97316' },
  sdf: { id: 'sdf', name: 'Sikkim Democratic Front', abbreviation: 'SDF', color: '#dc2626' },
  caps: { id: 'caps', name: 'Citizen Action Party-Sikkim', abbreviation: 'CAPS', color: '#0891b2' },
  srp: { id: 'srp', name: 'Sikkim Republican Party', abbreviation: 'SRP', color: '#7c3aed' },
}

const SIKKIM_ALIASES: Record<string, string> = {
  skm: 'skm', sikkimkrantikarimorcha: 'skm',
  sdf: 'sdf', sikkimdemocraticfront: 'sdf',
  caps: 'caps', citizenactionpartysikkim: 'caps',
  srp: 'srp', sikkimrepublicanparty: 'srp',
}

const resolveParty = createPartyResolver(SIKKIM_PARTIES, SIKKIM_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Sikkim', house: 'Vidhan Sabha', electionYear: 2024, resolveParty, provenance: PROVENANCE },
)

export const SIKKIM_CONSTITUENCIES = constituencies
export const SIKKIM_CANDIDATES = candidates
