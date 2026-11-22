/**
 * REAL dataset — Assam 2021 Legislative Assembly.
 * `affidavits.assam2021.json`, 940 candidates, all 126 constituencies,
 * every winner flagged, zero anomalies — fourth state (after Gujarat,
 * Madhya Pradesh, Haryana) to come back perfectly clean.
 */

import affidavitData from './affidavits.assam2021.json'
import type { DataProvenance, Party } from '../../domain/types'
import { buildScrapedState, type RawAffidavit } from '../scrapedState'
import { createPartyResolver } from '../partyResolver'

const PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2021-03',
}

const ASSAM_PARTIES: Record<string, Party> = {
  agp: { id: 'agp', name: 'Asom Gana Parishad', abbreviation: 'AGP', color: '#059669' },
  aiudf: { id: 'aiudf', name: 'All India United Democratic Front', abbreviation: 'AIUDF', color: '#0891b2' },
  bpf: { id: 'bpf', name: "Bodoland People's Front", abbreviation: 'BPF', color: '#dc2626' },
  ajp: { id: 'ajp', name: 'Assam Jatiya Parishad', abbreviation: 'AJP', color: '#f59e0b' },
}

const ASSAM_ALIASES: Record<string, string> = {
  agp: 'agp', asomganaparishad: 'agp',
  aiudf: 'aiudf', allindiauniteddemocraticfront: 'aiudf',
  bpf: 'bpf', bodolandpeoplesfront: 'bpf',
  ajp: 'ajp', assamjatiyaparishad: 'ajp',
}

const resolveParty = createPartyResolver(ASSAM_PARTIES, ASSAM_ALIASES)

const { constituencies, candidates } = buildScrapedState(
  (affidavitData as unknown as { candidates: RawAffidavit[] }).candidates,
  { state: 'Assam', house: 'Vidhan Sabha', electionYear: 2021, resolveParty, provenance: PROVENANCE },
)

export const ASSAM_CONSTITUENCIES = constituencies
export const ASSAM_CANDIDATES = candidates
