/**
 * REAL dataset — Rajasthan 2023 Legislative Assembly.
 *
 * `affidavits.rajasthan2023.json`, 1,867 candidates, all 200 constituencies.
 * 199/200 winners flagged — Karanpur genuinely had no winner in this general
 * round: its INC candidate died mid-campaign, voting there was postponed,
 * and the seat was decided in a separate bye-election in Feb 2024. Not a
 * scraping gap; we show no badge either way since we never guess.
 */

import affidavitData from './affidavits.rajasthan2023.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2023-11',
}

const RAJASTHAN_PARTIES: Record<string, Party> = {
  rlp: { id: 'rlp', name: 'Rashtriya Loktantrik Party', abbreviation: 'RLP', color: '#059669' },
  asp: { id: 'asp', name: 'Aazad Samaj Party (Kanshi Ram)', abbreviation: 'ASP', color: '#2563eb' },
  bap: { id: 'bap', name: 'Bharat Adivasi Party', abbreviation: 'BAP', color: '#dc2626' },
  btp: { id: 'btp', name: 'Bhartiya Tribal Party', abbreviation: 'BTP', color: '#16a34a' },
}

const RAJASTHAN_ALIASES: Record<string, string> = {
  rlp: 'rlp', rashtriyaloktantrikparty: 'rlp',
  asp: 'asp', aazadsamajpartykanshiram: 'asp', aazadsamajparty: 'asp',
  bap: 'bap', bharatadivasiparty: 'bap',
  btp: 'btp', bhartiyatribalparty: 'btp', bharatiyatribalparty: 'btp',
}

const resolveParty = createPartyResolver(RAJASTHAN_PARTIES, RAJASTHAN_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Rajasthan', house: 'Vidhan Sabha', electionYear: 2023, resolveParty, provenance: PROVENANCE },
)

export const RAJASTHAN_CONSTITUENCIES = constituencies
export const RAJASTHAN_CANDIDATES = candidates
