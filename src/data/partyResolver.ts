/**
 * Shared party registry + resolver factory.
 *
 * Scraped sources reference parties inconsistently — by abbreviation ("BJP"),
 * full name ("Bharatiya Janata Party"), or the combined MyNeta title form
 * ("Bharatiya Janata Party(BJP)"). Each state builds a resolver from the
 * national registry plus its own regional parties; unknown parties fall back
 * to a generic grey chip with a derived abbreviation.
 */

import type { Party } from '../domain/types'

/** Parties that contest across states, with brand colours. */
export const NATIONAL_PARTIES: Record<string, Party> = {
  bjp: { id: 'bjp', name: 'Bharatiya Janata Party', abbreviation: 'BJP', color: '#f97316' },
  inc: { id: 'inc', name: 'Indian National Congress', abbreviation: 'INC', color: '#3b82f6' },
  aap: { id: 'aap', name: 'Aam Aadmi Party', abbreviation: 'AAP', color: '#0ea5e9' },
  aitc: { id: 'aitc', name: 'All India Trinamool Congress', abbreviation: 'AITC', color: '#16a34a' },
  ncp: { id: 'ncp', name: 'Nationalist Congress Party', abbreviation: 'NCP', color: '#14b8a6' },
  shs: { id: 'shs', name: 'Shiv Sena', abbreviation: 'SHS', color: '#ea580c' },
  bsp: { id: 'bsp', name: 'Bahujan Samaj Party', abbreviation: 'BSP', color: '#1d4ed8' },
  cpim: { id: 'cpim', name: 'Communist Party of India (Marxist)', abbreviation: 'CPI(M)', color: '#dc2626' },
  cpi: { id: 'cpi', name: 'Communist Party of India', abbreviation: 'CPI', color: '#ef4444' },
  cpiml: { id: 'cpiml', name: 'CPI (ML) Liberation', abbreviation: 'CPI(ML)', color: '#b91c1c' },
  ind: { id: 'ind', name: 'Independent', abbreviation: 'IND', color: '#6b7280' },
}

/** Normalized string (abbrev or full name) -> national party id. */
export const NATIONAL_ALIASES: Record<string, string> = {
  aap: 'aap', aamaadmiparty: 'aap',
  aitc: 'aitc', tmc: 'aitc', allindiatrinamoolcongress: 'aitc',
  bjp: 'bjp', bharatiyajanataparty: 'bjp',
  inc: 'inc', congress: 'inc', indiannationalcongress: 'inc',
  ind: 'ind', independent: 'ind',
  ncp: 'ncp', nationalistcongressparty: 'ncp',
  shs: 'shs', shivsena: 'shs',
  bsp: 'bsp', bahujansamajparty: 'bsp',
  cpim: 'cpim', communistpartyofindiamarxist: 'cpim',
  cpi: 'cpi', communistpartyofindia: 'cpi',
  cpimll: 'cpiml', cpiml: 'cpiml', communistpartyofindiamarxistleninistliberation: 'cpiml',
  communistpartyofindiamarxistcpim: 'cpim',
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')

/** Split a trailing balanced "(...)": "X (Y)(Z)" -> prefix "X (Y)", inner "Z". */
function matchTrailingParen(
  s: string,
): { prefix: string; inner: string } | null {
  if (!s.endsWith(')')) return null
  let depth = 0
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === ')') depth++
    else if (s[i] === '(') {
      depth--
      if (depth === 0) {
        const inner = s.slice(i + 1, -1).trim()
        return inner ? { prefix: s.slice(0, i).trim(), inner } : null
      }
    }
  }
  return null
}

function deriveAbbreviation(raw: string): string {
  const trimmed = raw.trim()
  if (/^[A-Z]{2,6}$/.test(trimmed)) return trimmed
  return (
    trimmed
      .split(/\s+/)
      .filter((w) => w && !/^(party|the|of|and)$/i.test(w))
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 5) || trimmed.slice(0, 5).toUpperCase()
  )
}

export type PartyResolver = (raw: string | null | undefined) => Party

/** Build a resolver over the national registry plus state-specific parties. */
export function createPartyResolver(
  extraParties: Record<string, Party> = {},
  extraAliases: Record<string, string> = {},
): PartyResolver {
  const parties = { ...NATIONAL_PARTIES, ...extraParties }
  const aliases = { ...NATIONAL_ALIASES, ...extraAliases }
  const generic = new Map<string, Party>()

  function lookup(s: string): Party | undefined {
    const id = aliases[norm(s)]
    return id ? parties[id] : undefined
  }

  return function resolveParty(raw) {
    if (!raw) return parties.ind
    const direct = lookup(raw)
    if (direct) return direct

    // Peel trailing "(...)" groups — "Full Name(ABBR)", "X (Y)(CPI(M))" — and
    // try each layer as an abbreviation or name.
    let s = raw.trim()
    let abbrevHint: string | null = null
    for (let m = matchTrailingParen(s); m; m = matchTrailingParen(s)) {
      if (!abbrevHint && /^[A-Z]{2,6}(\([A-Z]\))?$/.test(m.inner))
        abbrevHint = m.inner
      const hit = lookup(m.inner) ?? lookup(m.prefix)
      if (hit) return hit
      s = m.prefix
    }

    const key = norm(raw)
    let party = generic.get(key)
    if (!party) {
      const name = s || raw.trim()
      party = {
        id: `x-${key}`,
        name,
        abbreviation: abbrevHint ?? deriveAbbreviation(name),
        color: '#6b7280',
      }
      generic.set(key, party)
    }
    return party
  }
}
