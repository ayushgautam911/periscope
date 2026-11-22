/**
 * REAL dataset — Kerala 2021 Vidhan Sabha.
 *
 * Built from the scraped Form 26 affidavit roster
 * (`affidavits.kerala2021.json`, 925 candidates, all 140 constituencies; the
 * 4 post-2021 bye-elections are excluded at copy time). Winner flags come from
 * the scrape (`is_winner`) and cover 135 of 140 seats — the source's winner
 * list is missing Kaduthuruthy, Kattakkada, Nemom, Thrithala and Tirur, whose
 * winners are absent from the roster too, so those seats carry no "won" badge
 * rather than a guessed one. Vote counts are not included.
 */

import affidavitData from './affidavits.kerala2021.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2021-04',
}

const KERALA_PARTIES: Record<string, Party> = {
  iuml: { id: 'iuml', name: 'Indian Union Muslim League', abbreviation: 'IUML', color: '#15803d' },
  kcm: { id: 'kcm', name: 'Kerala Congress (M)', abbreviation: 'KC(M)', color: '#1d4ed8' },
  kc: { id: 'kc', name: 'Kerala Congress', abbreviation: 'KC', color: '#2563eb' },
  rsp: { id: 'rsp', name: 'Revolutionary Socialist Party', abbreviation: 'RSP', color: '#b91c1c' },
  jds: { id: 'jds', name: 'Janata Dal (Secular)', abbreviation: 'JD(S)', color: '#16a34a' },
  sdpi: { id: 'sdpi', name: 'Social Democratic Party of India', abbreviation: 'SDPI', color: '#047857' },
  bdjs: { id: 'bdjs', name: 'Bharath Dharma Jana Sena', abbreviation: 'BDJS', color: '#ca8a04' },
  sucic: { id: 'sucic', name: 'SUCI (Communist)', abbreviation: 'SUCI(C)', color: '#dc2626' },
  wpi: { id: 'wpi', name: 'Welfare Party of India', abbreviation: 'WPI', color: '#0891b2' },
  twenty20: { id: 'twenty20', name: 'Twenty 20 Party', abbreviation: 'T20', color: '#7c3aed' },
}

const KERALA_ALIASES: Record<string, string> = {
  iuml: 'iuml', indianunionmuslimleague: 'iuml', muslimleaguekeralastatecommittee: 'iuml',
  kcm: 'kcm', keralacongressm: 'kcm',
  kc: 'kc', keralacongress: 'kc',
  rsp: 'rsp', revolutionarysocialistparty: 'rsp',
  jds: 'jds', janatadalsecular: 'jds',
  sdpi: 'sdpi', socialdemocraticpartyofindia: 'sdpi',
  bdjs: 'bdjs', bharathdharmajanasena: 'bdjs',
  sucic: 'sucic', suci: 'sucic', socialistunitycentreofindiacommunist: 'sucic',
  wpi: 'wpi', welfarepartyofindia: 'wpi',
  twenty20: 'twenty20', twentyparty: 'twenty20', twenty20party: 'twenty20',
}

const resolveParty = createPartyResolver(KERALA_PARTIES, KERALA_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  {
    state: 'Kerala',
    house: 'Vidhan Sabha',
    electionYear: 2021,
    resolveParty,
    provenance: PROVENANCE,
  },
)

export const KERALA_CONSTITUENCIES = constituencies
export const KERALA_CANDIDATES = candidates
