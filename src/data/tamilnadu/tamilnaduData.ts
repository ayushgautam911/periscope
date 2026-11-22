/**
 * REAL dataset — Tamil Nadu 2021 Legislative Assembly.
 * `affidavits.tamilnadu2021.json`, 3,856 candidates, all 234 constituencies.
 * 224/234 winners flagged — the source's winner list misses 10 seats whose
 * winners aren't in the roster either; we never guess.
 */

import affidavitData from './affidavits.tamilnadu2021.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2021-04',
}

const TAMILNADU_PARTIES: Record<string, Party> = {
  ntk: { id: 'ntk', name: 'Naam Tamilar Katchi', abbreviation: 'NTK', color: '#dc2626' },
  aiadmk: { id: 'aiadmk', name: 'All India Anna Dravida Munnetra Kazhagam', abbreviation: 'AIADMK', color: '#059669' },
  dmk: { id: 'dmk', name: 'Dravida Munnetra Kazhagam', abbreviation: 'DMK', color: '#dc2626' },
  mnm: { id: 'mnm', name: 'Makkal Needhi Maiam', abbreviation: 'MNM', color: '#0891b2' },
  ammk: { id: 'ammk', name: 'Amma Makkal Munnettra Kazagam', abbreviation: 'AMMK', color: '#16a34a' },
  dmdk: { id: 'dmdk', name: 'Desiya Murpokku Dravida Kazhagam', abbreviation: 'DMDK', color: '#f59e0b' },
  ijk: { id: 'ijk', name: 'Indiya Jananayaka Katchi', abbreviation: 'IJK', color: '#7c3aed' },
  ptk: { id: 'ptk', name: 'Puthiya Tamilagam', abbreviation: 'PTK', color: '#0ea5e9' },
}

const TAMILNADU_ALIASES: Record<string, string> = {
  ntk: 'ntk', naamtamilarkatchi: 'ntk',
  aiadmk: 'aiadmk', allindiaannadravidamunnetrakazhagam: 'aiadmk',
  dmk: 'dmk', dravidamunnetrakazhagam: 'dmk',
  mnm: 'mnm', makkalneedhimaiam: 'mnm',
  ammk: 'ammk', ammamakkalmunnettrakazagam: 'ammk',
  dmdk: 'dmdk', desiyamurpokkudravidakazhagam: 'dmdk',
  ijk: 'ijk', indiyajananayakakatchi: 'ijk',
  ptk: 'ptk', puthiyatamilagam: 'ptk',
}

const resolveParty = createPartyResolver(TAMILNADU_PARTIES, TAMILNADU_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Tamil Nadu', house: 'Vidhan Sabha', electionYear: 2021, resolveParty, provenance: PROVENANCE },
)

export const TAMILNADU_CONSTITUENCIES = constituencies
export const TAMILNADU_CANDIDATES = candidates
