/**
 * REAL dataset — Puducherry 2021 Legislative Assembly.
 * `affidavits.puducherry2021.json`, 318 candidates, all 30 constituencies.
 */

import affidavitData from './affidavits.puducherry2021.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2021-04',
}

const PUDUCHERRY_PARTIES: Record<string, Party> = {
  ntk: { id: 'ntk', name: 'Naam Tamilar Katchi', abbreviation: 'NTK', color: '#dc2626' },
  dmdk: { id: 'dmdk', name: 'Desiya Murpokku Dravida Kazhagam', abbreviation: 'DMDK', color: '#f59e0b' },
  ammk: { id: 'ammk', name: 'Amma Makkal Munnettra Kazagam', abbreviation: 'AMMK', color: '#16a34a' },
  mnm: { id: 'mnm', name: 'Makkal Needhi Maiam', abbreviation: 'MNM', color: '#0891b2' },
  ijk: { id: 'ijk', name: 'Indiya Jananayaka Katchi', abbreviation: 'IJK', color: '#7c3aed' },
  ainrc: { id: 'ainrc', name: 'All India N.R. Congress', abbreviation: 'AINRC', color: '#ea580c' },
  dmk: { id: 'dmk', name: 'Dravida Munnetra Kazhagam', abbreviation: 'DMK', color: '#dc2626' },
}

const PUDUCHERRY_ALIASES: Record<string, string> = {
  ntk: 'ntk', naamtamilarkatchi: 'ntk',
  dmdk: 'dmdk', desiyamurpokkudravidakazhagam: 'dmdk',
  ammk: 'ammk', ammamakkalmunnettrakazagam: 'ammk',
  mnm: 'mnm', makkalneedhimaiam: 'mnm',
  ijk: 'ijk', indiyajananayakakatchi: 'ijk',
  ainrc: 'ainrc', allindianrcongress: 'ainrc',
  dmk: 'dmk', dravidamunnetrakazhagam: 'dmk',
}

const resolveParty = createPartyResolver(PUDUCHERRY_PARTIES, PUDUCHERRY_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Puducherry', house: 'Vidhan Sabha', electionYear: 2021, resolveParty, provenance: PROVENANCE },
)

export const PUDUCHERRY_CONSTITUENCIES = constituencies
export const PUDUCHERRY_CANDIDATES = candidates
