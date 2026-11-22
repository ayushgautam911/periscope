/**
 * REAL dataset — Gujarat 2022 Vidhan Sabha.
 *
 * Built from the scraped Form 26 affidavit roster
 * (`affidavits.gujarat2022.json`, 1,624 candidates, all 182 constituencies;
 * post-2022 bye-elections excluded at copy time). Winner flags come from the
 * scrape (`is_winner`) and cover all 182 seats. Vote counts are not included.
 */

import affidavitData from './affidavits.gujarat2022.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2022-12',
}

const GUJARAT_PARTIES: Record<string, Party> = {
  btp: { id: 'btp', name: 'Bhartiya Tribal Party', abbreviation: 'BTP', color: '#16a34a' },
  ggp: { id: 'ggp', name: 'Garvi Gujarat Party', abbreviation: 'GGP', color: '#ca8a04' },
  sp: { id: 'sp', name: 'Samajwadi Party', abbreviation: 'SP', color: '#dc2626' },
}

const GUJARAT_ALIASES: Record<string, string> = {
  btp: 'btp', bhartiyatribalparty: 'btp', bharatiyatribalparty: 'btp',
  ggp: 'ggp', garvigujaratparty: 'ggp',
  sp: 'sp', samajwadiparty: 'sp',
}

const resolveParty = createPartyResolver(GUJARAT_PARTIES, GUJARAT_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  {
    state: 'Gujarat',
    house: 'Vidhan Sabha',
    electionYear: 2022,
    resolveParty,
    provenance: PROVENANCE,
  },
)

export const GUJARAT_CONSTITUENCIES = constituencies
export const GUJARAT_CANDIDATES = candidates
