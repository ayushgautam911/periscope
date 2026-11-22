/**
 * REAL dataset — Meghalaya 2023 Legislative Assembly.
 * `affidavits.meghalaya2023.json`, 382 candidates, all 60 constituencies.
 */

import affidavitData from './affidavits.meghalaya2023.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2023-02',
}

const MEGHALAYA_PARTIES: Record<string, Party> = {
  npp: { id: 'npp', name: "National People's Party", abbreviation: 'NPP', color: '#0ea5e9' },
  udp: { id: 'udp', name: 'United Democratic Party', abbreviation: 'UDP', color: '#16a34a' },
  vpp: { id: 'vpp', name: 'Voice of the People Party', abbreviation: 'VPP', color: '#7c3aed' },
  hspdp: { id: 'hspdp', name: "Hill State People's Democratic Party", abbreviation: 'HSPDP', color: '#ca8a04' },
  pdf: { id: 'pdf', name: "People's Democratic Front", abbreviation: 'PDF', color: '#ea580c' },
}

const MEGHALAYA_ALIASES: Record<string, string> = {
  npp: 'npp', nationalpeoplesparty: 'npp',
  udp: 'udp', uniteddemocraticparty: 'udp',
  vpp: 'vpp', voiceofthepeopleparty: 'vpp',
  hspdp: 'hspdp', hillstatepeoplesdemocraticparty: 'hspdp',
  pdf: 'pdf', peoplesdemocraticfront: 'pdf',
}

const resolveParty = createPartyResolver(MEGHALAYA_PARTIES, MEGHALAYA_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Meghalaya', house: 'Vidhan Sabha', electionYear: 2023, resolveParty, provenance: PROVENANCE },
)

export const MEGHALAYA_CONSTITUENCIES = constituencies
export const MEGHALAYA_CANDIDATES = candidates
