/**
 * REAL dataset — Uttarakhand 2022 Legislative Assembly.
 *
 * `affidavits.uttarakhand2022.json`, 630 candidates, all 70 constituencies.
 * Bageshwar's 2022 winner (Chandan Ram Dass) passed away in office; his
 * successor's 2023 bye-election candidate was scraped under a constituency
 * title that hid the "BYE ELECTION" marker behind a reservation tag
 * ("BAGESHWAR (SC) : BYE ELECTION ..."). Fixed at copy time — the bye
 * candidate is excluded from this general-election roster.
 */

import affidavitData from './affidavits.uttarakhand2022.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2022-03',
}

const UTTARAKHAND_PARTIES: Record<string, Party> = {
  ukd: { id: 'ukd', name: 'Uttarakhand Kranti Dal', abbreviation: 'UKD', color: '#059669' },
}

const UTTARAKHAND_ALIASES: Record<string, string> = {
  ukd: 'ukd', uttarakhandkrantidal: 'ukd',
}

const resolveParty = createPartyResolver(UTTARAKHAND_PARTIES, UTTARAKHAND_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Uttarakhand', house: 'Vidhan Sabha', electionYear: 2022, resolveParty, provenance: PROVENANCE },
)

export const UTTARAKHAND_CONSTITUENCIES = constituencies
export const UTTARAKHAND_CANDIDATES = candidates
