/**
 * REAL dataset — Karnataka 2023 Legislative Assembly.
 * `affidavits.karnataka2023.json`, 2,574 candidates, all 224 constituencies.
 * 4 bye-elections excluded at copy time.
 */

import affidavitData from './affidavits.karnataka2023.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2023-05',
}

const KARNATAKA_PARTIES: Record<string, Party> = {
  krs: { id: 'krs', name: 'Karnataka Rashtra Samithi', abbreviation: 'KRS', color: '#059669' },
  upp: { id: 'upp', name: 'Uttama Prajaakeeya Party', abbreviation: 'UPP', color: '#7c3aed' },
  krpp: { id: 'krpp', name: 'Kalyana Rajya Pragathi Paksha', abbreviation: 'KRPP', color: '#f59e0b' },
  imp: { id: 'imp', name: 'Indian Movement Party', abbreviation: 'IMP', color: '#0891b2' },
}

const KARNATAKA_ALIASES: Record<string, string> = {
  krs: 'krs', karnatakarashra: 'krs', karnatakarashtrasami: 'krs',
  upp: 'upp', uttamapraja: 'upp', uttamaprajaakeeya: 'upp',
  krpp: 'krpp', kalyana: 'krpp',
  imp: 'imp', indianmovement: 'imp',
}

const resolveParty = createPartyResolver(KARNATAKA_PARTIES, KARNATAKA_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Karnataka', house: 'Vidhan Sabha', electionYear: 2023, resolveParty, provenance: PROVENANCE },
)

export const KARNATAKA_CONSTITUENCIES = constituencies
export const KARNATAKA_CANDIDATES = candidates
