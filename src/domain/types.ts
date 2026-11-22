/**
 * Core domain model for Periscope.
 *
 * These types are deliberately source-agnostic: they describe a candidate as a
 * voter cares about them, not as any particular dataset happens to be shaped.
 * The data-access layer (`src/data`) maps a real source (ECI affidavits, an
 * ADR/MyNeta feed, election results, ...) onto these types.
 *
 * Affidavit-derived fields (age, education, criminal record, finances) are
 * OPTIONAL: real datasets often have a candidate's party and result without
 * their affidavit details. The UI renders missing fields as "Not available"
 * rather than letting anyone invent them.
 */

import type { EducationLevel } from './education'

/** A house/seat being contested. India-flavoured but kept minimal. */
export type House = 'Lok Sabha' | 'Vidhan Sabha'

export interface Constituency {
  id: string
  /** Display name, e.g. "Panaji". */
  name: string
  /** Official constituency number within the house, if known. */
  number?: number
  state: string
  house: House
  /** Election year this candidate set belongs to. */
  electionYear: number
}

export interface Party {
  id: string
  name: string
  /** Short form shown in tight UI, e.g. "BJP". */
  abbreviation: string
  /** Optional brand colour (hex) for chips/accents. */
  color?: string
}

/** A single declared criminal case from the candidate's affidavit (Form 26). */
export interface CriminalCase {
  /** IPC sections invoked, e.g. ["376", "342", "506"]. */
  sections: string[]
  /** Whether this case involves a serious offence. */
  serious: boolean
  /** Non-IPC acts/sections, e.g. "Section 4 of POCSO Act". */
  otherActs?: string
  court?: string
  firNo?: string
  caseNo?: string
  /** Whether the court has framed charges (null = not stated). */
  chargesFramed?: boolean | null
  /** "pending" | "convicted". */
  status?: string
  /** Sentence/penalty text, for convicted cases. */
  punishment?: string
}

/** Summary of the candidate's declared criminal record. */
export interface CriminalRecord {
  totalCases: number
  seriousCases: number
  /** Optional detail; summary counts are authoritative for comparison. */
  cases?: CriminalCase[]
}

/** Declared financials, all amounts in INR (rupees, not lakh/crore). */
export interface Finances {
  totalAssets: number
  /** Optional: some sources report assets without a liabilities figure. */
  totalLiabilities?: number
  movableAssets?: number
  immovableAssets?: number
}

/** How a candidate placed in the election, when results are known. */
export type ElectionOutcome = 'won' | 'runner_up' | 'contested'

/** Where a candidate's data came from — surfaced in the UI for trust. */
export interface DataProvenance {
  /** e.g. "Sample data", "ECI affidavit", "Election results (Wikipedia)". */
  provider: string
  /** Source URL, if any. */
  url?: string
  /** ISO date the data reflects, if known. */
  asOf?: string
}

export interface Candidate {
  id: string
  name: string
  party: Party
  constituencyId: string

  // ── Result fields (from election results — often available) ──
  outcome?: ElectionOutcome
  votes?: number
  voteSharePct?: number

  // ── Affidavit fields (often unavailable; never fabricated) ──
  age?: number
  gender?: 'Male' | 'Female' | 'Other'
  education?: EducationLevel
  profession?: string
  criminalRecord?: CriminalRecord
  finances?: Finances

  photoUrl?: string
  provenance: DataProvenance
}

/**
 * Net worth is always derived, never stored, so it can't drift. Returns null
 * when liabilities weren't declared (we don't assume zero).
 */
export function netWorth(finances: Finances): number | null {
  if (finances.totalLiabilities == null) return null
  return finances.totalAssets - finances.totalLiabilities
}

/** The winner among a set of candidates, if a result is recorded. */
export function findLeader(candidates: Candidate[]): Candidate | undefined {
  return candidates.find((c) => c.outcome === 'won')
}
