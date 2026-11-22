/**
 * REAL dataset — Delhi 2025 Vidhan Sabha.
 *
 * Built entirely from the scraped Form 26 affidavit roster
 * (`affidavits.delhi2025.json`, 698 candidates, all 70 constituencies).
 * Winner flags come from the scrape (`is_winner`), so no curated results
 * overlay is needed; vote counts are not included.
 */

import affidavitData from './affidavits.delhi2025.json'
import type { DataProvenance } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2025-02',
}

// Delhi has no regional parties needing brand colours beyond the national set.
const resolveParty = createPartyResolver()

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  {
    state: 'Delhi',
    house: 'Vidhan Sabha',
    electionYear: 2025,
    resolveParty,
    provenance: PROVENANCE,
  },
)

export const DELHI_CONSTITUENCIES = constituencies
export const DELHI_CANDIDATES = candidates
