/**
 * REAL dataset — Arunachal Pradesh 2024 Vidhan Sabha.
 *
 * Built from the scraped Form 26 affidavit roster
 * (`affidavits.arunachal2024.json`, 142 candidates, 59 of 60 constituencies —
 * one seat's roster is not in the archive). Nine seats have a single candidate:
 * these are the genuine unopposed BJP wins. Winner flags come from the scrape
 * (`is_winner`); vote counts are not included.
 */

import affidavitData from './affidavits.arunachal2024.json'
import type { Constituency, DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2024-06',
}

const ARP_PARTIES: Record<string, Party> = {
  npp: { id: 'npp', name: "National People's Party", abbreviation: 'NPP', color: '#0ea5e9' },
  ppa: { id: 'ppa', name: "People's Party of Arunachal", abbreviation: 'PPA', color: '#16a34a' },
  adp: { id: 'adp', name: 'Arunachal Democratic Party', abbreviation: 'ADP', color: '#f59e0b' },
}

const ARP_ALIASES: Record<string, string> = {
  npp: 'npp', nationalpeoplesparty: 'npp',
  ppa: 'ppa', peoplespartyofarunachal: 'ppa',
  adp: 'adp', arunachaldemocraticparty: 'adp',
}

const resolveParty = createPartyResolver(ARP_PARTIES, ARP_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  {
    state: 'Arunachal Pradesh',
    house: 'Vidhan Sabha',
    electionYear: 2024,
    resolveParty,
    provenance: PROVENANCE,
  },
)

// Sagalee is a real 2024 seat but absent from the source dataset (the scrape
// carries only 59 of 60 AP seats). List it as a placeholder — zero candidates —
// so voters see the seat exists; the comparison page shows "updated soon".
const SAGALEE: Constituency = {
  id: 'sagalee',
  name: 'Sagalee',
  state: 'Arunachal Pradesh',
  house: 'Vidhan Sabha',
  electionYear: 2024,
}

export const ARUNACHAL_CONSTITUENCIES = [...constituencies, SAGALEE].sort(
  (a, b) => a.name.localeCompare(b.name),
)
export const ARUNACHAL_CANDIDATES = candidates
