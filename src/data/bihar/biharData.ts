/**
 * REAL dataset — Bihar 2025 Vidhan Sabha.
 *
 * Built entirely from the scraped Form 26 affidavit roster
 * (`affidavits.bihar2025.json`, 2,600 candidates, all 243 constituencies —
 * incl. the duplicate seat names Kalyanpur and Pipra, disambiguated by
 * district). Winner flags come from the scrape (`is_winner`); vote counts are
 * not included.
 */

import affidavitData from './affidavits.bihar2025.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2025-11',
}

const BIHAR_PARTIES: Record<string, Party> = {
  rjd: { id: 'rjd', name: 'Rashtriya Janata Dal', abbreviation: 'RJD', color: '#15803d' },
  jdu: { id: 'jdu', name: 'Janata Dal (United)', abbreviation: 'JD(U)', color: '#059669' },
  jsp: { id: 'jsp', name: 'Jan Suraaj Party', abbreviation: 'JSP', color: '#eab308' },
  ljprv: { id: 'ljprv', name: 'Lok Janshakti Party (Ram Vilas)', abbreviation: 'LJP(RV)', color: '#6366f1' },
  rljp: { id: 'rljp', name: 'Rashtriya Lok Janshakti Party', abbreviation: 'RLJP', color: '#818cf8' },
  ham: { id: 'ham', name: 'Hindustani Awam Morcha (Secular)', abbreviation: 'HAM', color: '#8b5cf6' },
  aimim: { id: 'aimim', name: 'All India Majlis-E-Ittehadul Muslimeen', abbreviation: 'AIMIM', color: '#047857' },
  vip: { id: 'vip', name: 'Vikassheel Insaan Party', abbreviation: 'VIP', color: '#d946ef' },
}

const BIHAR_ALIASES: Record<string, string> = {
  rjd: 'rjd', rashtriyajanatadal: 'rjd',
  jdu: 'jdu', janatadalunited: 'jdu',
  jsp: 'jsp', jansuraajparty: 'jsp', jansuraaj: 'jsp',
  ljprv: 'ljprv', lokjanshaktipartyramvilas: 'ljprv',
  rljp: 'rljp', rashtriyalokjanshaktiparty: 'rljp',
  ham: 'ham', hams: 'ham', hindustaniawammorchasecular: 'ham', hindustaniawammorcha: 'ham',
  aimim: 'aimim', allindiamajliseittehadulmuslimeen: 'aimim',
  vip: 'vip', vikassheelinsaanparty: 'vip',
}

const resolveParty = createPartyResolver(BIHAR_PARTIES, BIHAR_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  {
    state: 'Bihar',
    house: 'Vidhan Sabha',
    electionYear: 2025,
    resolveParty,
    provenance: PROVENANCE,
  },
)

export const BIHAR_CONSTITUENCIES = constituencies
export const BIHAR_CANDIDATES = candidates
