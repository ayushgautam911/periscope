/**
 * The scraped Form 26 affidavit data (`affidavits.goa2022.json`, produced by the
 * `pipeline/` MyNeta scraper) is the source of the FULL candidate roster per
 * constituency. This module groups it by constituency and maps each record onto
 * the domain model; `goaData.ts` overlays election results (votes/outcome) on top.
 *
 * Constituency is the join key (normalized; reserved-category suffixes like
 * "(SC)" stripped). Within a constituency, names are matched by surname + token
 * overlap, since results names are sometimes shorter than the affidavit's full
 * legal name (e.g. "Carlos Ferreira" vs "Carlos Alvares Ferreira").
 */

import affidavitData from './affidavits.goa2022.json'
import type { DataProvenance } from '../../domain/types'
import {
  toFields,
  type AffidavitFields,
  type RawAffidavit,
} from '../scrapedState'

export type { AffidavitFields }

/** One scraped candidate: identity + party + affidavit fields. */
export interface ScrapedCandidate {
  name: string
  party: string | null
  isWinner: boolean
  tokens: Set<string>
  fields: AffidavitFields
}

export const AFFIDAVIT_PROVENANCE: DataProvenance = {
  provider: 'Public disclosure records',
  asOf: '2022-02',
}

const RECORDS = (affidavitData as { candidates: RawAffidavit[] }).candidates

const TITLES = /\b(dr|adv|advocate|shri|smt|kum|mr|mrs|ms|prof|capt|col|maj|er)\b/g

function normConstituency(name: string): string {
  return name
    .replace(/\(.*?\)/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(TITLES, ' ')
    .replace(/[^a-z ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1)
}

const byConstituency = new Map<string, ScrapedCandidate[]>()
for (const record of RECORDS) {
  if (!record.constituency) continue
  const candidate: ScrapedCandidate = {
    name: record.name,
    party: record.party ?? null,
    isWinner: record.is_winner ?? false,
    tokens: new Set(nameTokens(record.name)),
    fields: toFields(record),
  }
  const key = normConstituency(record.constituency)
  const list = byConstituency.get(key) ?? []
  list.push(candidate)
  byConstituency.set(key, list)
}

/** Every scraped candidate for a constituency (empty if none scraped). */
export function rosterFor(constituency: string): ScrapedCandidate[] {
  return byConstituency.get(normConstituency(constituency)) ?? []
}

/** Best name match within a roster (surname agrees, or 2+ tokens overlap). */
export function matchByName(
  roster: ScrapedCandidate[],
  candidateName: string,
): ScrapedCandidate | undefined {
  const want = nameTokens(candidateName)
  const wantSurname = want.at(-1) ?? ''
  let best: ScrapedCandidate | undefined
  let bestScore = 0
  for (const item of roster) {
    const shared = want.filter((t) => item.tokens.has(t)).length
    const surnameMatch =
      item.tokens.has(wantSurname) || want.includes([...item.tokens].at(-1) ?? '')
    if (((surnameMatch && shared >= 1) || shared >= 2) && shared > bestScore) {
      bestScore = shared
      best = item
    }
  }
  return best
}
