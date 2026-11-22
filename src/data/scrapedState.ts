/**
 * Generic adapter: pipeline JSON (myneta_pipeline / wayback output) -> domain
 * model. States whose scrape carries winner flags (`is_winner`) can be built
 * entirely from the scraped roster with no curated results overlay — one call
 * to `buildScrapedState` produces constituencies and candidates ready for a
 * repository. (Goa predates this and overlays curated vote counts; see
 * goa/goaData.ts.)
 */

import { EDUCATION_LEVELS, type EducationLevel } from '../domain/education'
import type {
  Candidate,
  Constituency,
  CriminalCase,
  CriminalRecord,
  DataProvenance,
  Finances,
  House,
} from '../domain/types'
import type { PartyResolver } from './partyResolver'

export interface RawCase {
  sections: string[]
  other_acts?: string | null
  court?: string | null
  fir_no?: string | null
  case_no?: string | null
  charges_framed?: boolean | null
  status?: string | null
  punishment?: string | null
  serious: boolean
}

export interface RawAffidavit {
  name: string
  constituency?: string | null
  party?: string | null
  age?: number | null
  education?: string | null
  profession?: string | null
  criminal_cases?: number | null
  serious_criminal_cases?: number | null
  total_assets?: number | null
  total_liabilities?: number | null
  movable_assets?: number | null
  immovable_assets?: number | null
  cases?: RawCase[] | null
  is_winner?: boolean | null
}

/** Affidavit-derived fields ready to layer onto a Candidate. */
export interface AffidavitFields {
  age?: number
  education?: EducationLevel
  profession?: string
  criminalRecord?: CriminalRecord
  finances?: Finances
}

function isEducationLevel(
  value: string | null | undefined,
): value is EducationLevel {
  return value != null && (EDUCATION_LEVELS as readonly string[]).includes(value)
}

export function toCase(c: RawCase): CriminalCase {
  const out: CriminalCase = { sections: c.sections ?? [], serious: c.serious }
  if (c.other_acts) out.otherActs = c.other_acts
  if (c.court) out.court = c.court
  if (c.fir_no) out.firNo = c.fir_no
  if (c.case_no) out.caseNo = c.case_no
  if (c.charges_framed != null) out.chargesFramed = c.charges_framed
  if (c.status) out.status = c.status
  if (c.punishment) out.punishment = c.punishment
  return out
}

export function toFields(r: RawAffidavit): AffidavitFields {
  const fields: AffidavitFields = {}
  if (r.age != null) fields.age = r.age
  if (isEducationLevel(r.education)) fields.education = r.education
  if (r.profession) fields.profession = r.profession
  if (r.criminal_cases != null) {
    const record: CriminalRecord = {
      totalCases: r.criminal_cases,
      seriousCases: r.serious_criminal_cases ?? 0,
    }
    if (r.cases && r.cases.length) record.cases = r.cases.map(toCase)
    fields.criminalRecord = record
  }
  if (r.total_assets != null) {
    const finances: Finances = { totalAssets: r.total_assets }
    if (r.total_liabilities != null) finances.totalLiabilities = r.total_liabilities
    if (r.movable_assets != null) finances.movableAssets = r.movable_assets
    if (r.immovable_assets != null) finances.immovableAssets = r.immovable_assets
    fields.finances = finances
  }
  return fields
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** "MODEL TOWN" -> "Model Town" (scrapes shout constituency names). */
function titleCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/(^|[\s-(])([a-z])/g, (m) => m.toUpperCase())
}

export interface ScrapedStateOptions {
  state: string
  house: House
  electionYear: number
  resolveParty: PartyResolver
  provenance: DataProvenance
}

export function buildScrapedState(
  records: RawAffidavit[],
  opts: ScrapedStateOptions,
): { constituencies: Constituency[]; candidates: Candidate[] } {
  const byConstituency = new Map<string, RawAffidavit[]>()
  for (const r of records) {
    if (!r.constituency) continue
    const list = byConstituency.get(r.constituency) ?? []
    list.push(r)
    byConstituency.set(r.constituency, list)
  }

  const constituencies: Constituency[] = []
  const candidates: Candidate[] = []

  for (const [rawName, group] of [...byConstituency.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    const name = titleCase(rawName)
    const id = slug(rawName)
    constituencies.push({
      id,
      name,
      state: opts.state,
      house: opts.house,
      electionYear: opts.electionYear,
    })

    group.sort((a, b) => {
      if ((b.is_winner ? 1 : 0) !== (a.is_winner ? 1 : 0))
        return (b.is_winner ? 1 : 0) - (a.is_winner ? 1 : 0)
      return (b.total_assets ?? 0) - (a.total_assets ?? 0)
    })

    group.forEach((r, i) => {
      candidates.push({
        id: `${id}-${i}`,
        name: r.name,
        party: opts.resolveParty(r.party),
        constituencyId: id,
        outcome: r.is_winner ? 'won' : 'contested',
        ...toFields(r),
        provenance: opts.provenance,
      })
    })
  }

  return { constituencies, candidates }
}
