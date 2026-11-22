/**
 * REAL dataset — Goa.
 *
 * All 40 Vidhan Sabha (Assembly) constituencies with their 2022 results, and
 * both Lok Sabha constituencies with their 2024 results. Each seat lists its
 * candidates in finishing order (winner, runner-up, then others) with real
 * party affiliations and vote counts; Lok Sabha seats also carry vote-share %.
 *
 * Source: Wikipedia results for the 2022 Goa Legislative Assembly election and
 * the 2024 Indian general election in Goa (incl. the per-constituency pages).
 * Winners and vote counts are well established. A runner-up is intentionally
 * omitted where the source looked inconsistent (we never publish a guessed fact
 * about a real person). Affidavit details (criminal cases, assets, age,
 * education) are NOT included — left undefined and shown as "not available".
 */

import type {
  Candidate,
  Constituency,
  DataProvenance,
  ElectionOutcome,
} from '../../domain/types'
import {
  AFFIDAVIT_PROVENANCE,
  matchByName,
  rosterFor,
  type ScrapedCandidate,
} from './affidavits'
import { resolveParty } from './parties'

/**
 * Curated election RESULT for one candidate (winner / runner-up): identity,
 * party, votes. The full field of contestants comes from the scraped roster;
 * these entries supply the outcome + vote counts overlaid on top.
 */
interface RawCandidate {
  name: string
  party: string
  votes?: number
  share?: number
}

interface RawSeat {
  no: number
  name: string
  /** Explicit id override (defaults to a slug of the name). */
  id?: string
  /** Candidates in finishing order: [winner, runner-up, ...others]. */
  candidates: RawCandidate[]
}

const STATE = 'Goa'

const ASSEMBLY_PROVENANCE: DataProvenance = {
  provider: '2022 Goa Assembly election',
  asOf: '2022-03-10',
}

const LOKSABHA_PROVENANCE: DataProvenance = {
  provider: '2024 Lok Sabha election',
  asOf: '2024-06-04',
}

// 2022 Goa Legislative Assembly — candidates in finishing order, with votes.
const ASSEMBLY_SEATS: RawSeat[] = [
  {
    no: 1,
    name: 'Mandrem',
    candidates: [
      { name: 'Jit Arolkar', party: 'mgp', votes: 10387 },
      { name: 'Dayanand Sopte', party: 'bjp', votes: 9672 },
    ],
  },
  {
    no: 2,
    name: 'Pernem',
    candidates: [
      { name: 'Pravin Arlekar', party: 'bjp', votes: 13063 },
      { name: 'Rajan Korgaonkar', party: 'mgp', votes: 9645 },
    ],
  },
  {
    no: 3,
    name: 'Bicholim',
    candidates: [
      { name: 'Chandrakant Shetye', party: 'ind', votes: 9608 },
      { name: 'Naresh Sawal', party: 'mgp', votes: 9290 },
    ],
  },
  {
    no: 4,
    name: 'Tivim',
    candidates: [
      { name: 'Nilkanth Halarnkar', party: 'bjp', votes: 9414 },
      { name: 'Kavita Kandolkar', party: 'aitc', votes: 7363 },
    ],
  },
  {
    no: 5,
    name: 'Mapusa',
    candidates: [
      { name: "Joshua D'Souza", party: 'bjp', votes: 10195 },
      { name: 'Sudhir Kandolkar', party: 'inc', votes: 8548 },
    ],
  },
  {
    no: 6,
    name: 'Siolim',
    candidates: [
      { name: 'Delilah Lobo', party: 'inc', votes: 9699 },
      { name: 'Dayanand Mandrekar', party: 'bjp', votes: 7972 },
    ],
  },
  {
    no: 7,
    name: 'Saligao',
    candidates: [
      { name: 'Kedar Naik', party: 'inc', votes: 10045 },
      { name: 'Jayesh Salgaonkar', party: 'bjp', votes: 8146 },
    ],
  },
  {
    no: 8,
    name: 'Calangute',
    candidates: [
      { name: 'Michael Lobo', party: 'inc', votes: 9285 },
      { name: 'Joseph Sequeira', party: 'bjp', votes: 4306 },
    ],
  },
  {
    no: 9,
    name: 'Porvorim',
    candidates: [
      { name: 'Rohan Khaunte', party: 'bjp', votes: 11714 },
      { name: 'Sandeep Vazarkar', party: 'aitc', votes: 3764 },
    ],
  },
  {
    no: 10,
    name: 'Aldona',
    candidates: [
      { name: 'Carlos Ferreira', party: 'inc', votes: 9320 },
      { name: 'Glenn Ticlo', party: 'bjp', votes: 7497 },
    ],
  },
  {
    no: 11,
    name: 'Panaji',
    candidates: [
      { name: 'Atanasio Monserrate', party: 'bjp', votes: 6787 },
      { name: 'Utpal Parrikar', party: 'ind', votes: 6071 },
    ],
  },
  {
    no: 12,
    name: 'Taleigao',
    candidates: [
      { name: 'Jennifer Monserrate', party: 'bjp', votes: 10167 },
      { name: 'Tony Rodrigues', party: 'inc', votes: 8126 },
    ],
  },
  {
    no: 13,
    name: 'St. Cruz',
    candidates: [
      { name: 'Rodolfo Fernandes', party: 'inc', votes: 8841 },
      { name: 'Antonio Fernandes', party: 'bjp', votes: 6377 },
    ],
  },
  {
    no: 14,
    name: 'St. Andre',
    candidates: [
      { name: 'Viresh Borkar', party: 'rgp', votes: 5395 },
      { name: 'Francisco Silveira', party: 'bjp', votes: 5319 },
    ],
  },
  {
    no: 15,
    name: 'Cumbarjua',
    candidates: [
      { name: 'Rajesh Faldessai', party: 'inc', votes: 6776 },
      { name: 'Janita Madkaikar', party: 'bjp', votes: 3949 },
    ],
  },
  {
    no: 16,
    name: 'Maem',
    candidates: [
      { name: 'Premendra Shet', party: 'bjp', votes: 7874 },
      { name: 'Santosh Sawant', party: 'gfp', votes: 4738 },
    ],
  },
  {
    no: 17,
    name: 'Sanquelim',
    candidates: [
      { name: 'Pramod Sawant', party: 'bjp', votes: 12250 },
      { name: 'Dharmesh Saglani', party: 'inc', votes: 11584 },
    ],
  },
  {
    no: 18,
    name: 'Poriem',
    candidates: [{ name: 'Deviya Rane', party: 'bjp', votes: 17816 }],
  },
  {
    no: 19,
    name: 'Valpoi',
    candidates: [
      { name: 'Vishwajit Rane', party: 'bjp', votes: 14462 },
      { name: 'Manoj Parab', party: 'rgp', votes: 6377 },
    ],
  },
  {
    no: 20,
    name: 'Priol',
    candidates: [
      { name: 'Govind Gaude', party: 'bjp', votes: 11019 },
      { name: 'Deepak Dhavalikar', party: 'mgp', votes: 10806 },
    ],
  },
  {
    no: 21,
    name: 'Ponda',
    candidates: [
      { name: 'Ravi Naik', party: 'bjp', votes: 7514 },
      { name: 'Ketan Bhatikar', party: 'mgp', votes: 7437 },
    ],
  },
  {
    no: 22,
    name: 'Siroda',
    candidates: [
      { name: 'Subhash Shirodkar', party: 'bjp', votes: 8307 },
      { name: 'Mahadev Naik', party: 'aap', votes: 6133 },
    ],
  },
  {
    no: 23,
    name: 'Marcaim',
    candidates: [
      { name: 'Sudin Dhavalikar', party: 'mgp', votes: 13963 },
      { name: 'Sudesh Bhingi', party: 'bjp', votes: 4000 },
    ],
  },
  {
    no: 24,
    name: 'Mormugao',
    candidates: [
      { name: 'Sankalp Amonkar', party: 'inc', votes: 9067 },
      { name: 'Milind Naik', party: 'bjp', votes: 7126 },
    ],
  },
  {
    no: 25,
    name: 'Vasco da Gama',
    candidates: [
      { name: 'Krishna Salkar', party: 'bjp', votes: 13118 },
      { name: 'Carlos Almeida', party: 'inc', votes: 9461 },
    ],
  },
  {
    no: 26,
    name: 'Dabolim',
    candidates: [
      { name: 'Mauvin Godinho', party: 'bjp', votes: 7594 },
      { name: 'Viriato Fernandes', party: 'inc', votes: 6024 },
    ],
  },
  {
    no: 27,
    name: 'Cortalim',
    candidates: [
      { name: 'Antonio Vas', party: 'ind', votes: 5522 },
      { name: 'Olencio Simoes', party: 'inc', votes: 4344 },
    ],
  },
  {
    no: 28,
    name: 'Nuvem',
    candidates: [
      { name: 'Aleixo Sequeira', party: 'inc', votes: 8745 },
      { name: "Arvind D'Costa", party: 'rgp', votes: 4348 },
    ],
  },
  {
    no: 29,
    name: 'Curtorim',
    candidates: [
      { name: 'Reginaldo Lourenco', party: 'ind', votes: 8960 },
      { name: 'Moreno Rebelo', party: 'inc', votes: 3905 },
    ],
  },
  {
    no: 30,
    name: 'Fatorda',
    candidates: [
      { name: 'Vijai Sardesai', party: 'gfp', votes: 11063 },
      { name: 'Damu Naik', party: 'bjp', votes: 9536 },
    ],
  },
  {
    no: 31,
    name: 'Margao',
    candidates: [
      { name: 'Digambar Kamat', party: 'inc', votes: 13674 },
      { name: 'Manohar Ajgaonkar', party: 'bjp', votes: 5880 },
    ],
  },
  {
    no: 32,
    name: 'Benaulim',
    candidates: [
      { name: 'Venzy Viegas', party: 'aap', votes: 6411 },
      { name: 'Churchill Alemao', party: 'aitc', votes: 5140 },
    ],
  },
  {
    no: 33,
    name: 'Navelim',
    candidates: [
      { name: 'Ulhas Tuenkar', party: 'bjp', votes: 5168 },
      { name: 'Valanka Alemao', party: 'aitc', votes: 4738 },
    ],
  },
  {
    no: 34,
    name: 'Cuncolim',
    candidates: [
      { name: 'Yuri Alemao', party: 'inc', votes: 9866 },
      { name: 'Clafasio Dias', party: 'bjp', votes: 6632 },
    ],
  },
  {
    no: 35,
    name: 'Velim',
    candidates: [
      { name: 'Cruz Silva', party: 'aap', votes: 5390 },
      { name: 'Savio Silva', party: 'inc', votes: 5221 },
    ],
  },
  {
    no: 36,
    name: 'Quepem',
    candidates: [
      { name: "Altone D'Costa", party: 'inc', votes: 14994 },
      { name: 'Chandrakant Kavlekar', party: 'bjp', votes: 11393 },
    ],
  },
  {
    no: 37,
    name: 'Curchorem',
    candidates: [
      { name: 'Nilesh Cabral', party: 'bjp', votes: 9973 },
      { name: 'Amit Patkar', party: 'inc', votes: 9301 },
    ],
  },
  {
    no: 38,
    name: 'Sanvordem',
    candidates: [
      { name: 'Ganesh Gaonkar', party: 'bjp', votes: 11877 },
      { name: 'Deepak Pauskar', party: 'ind', votes: 6687 },
    ],
  },
  {
    no: 39,
    name: 'Sanguem',
    candidates: [
      { name: 'Subhash Phal Desai', party: 'bjp', votes: 8724 },
      { name: 'Savitri Kavlekar', party: 'ind', votes: 7295 },
    ],
  },
  {
    no: 40,
    name: 'Canacona',
    candidates: [
      { name: 'Ramesh Tawadkar', party: 'bjp', votes: 9063 },
      { name: 'Isidore Fernandes', party: 'ind', votes: 6012 },
    ],
  },
]

// 2024 Lok Sabha — full candidate rosters (votes + vote share).
const LOKSABHA_SEATS: RawSeat[] = [
  {
    no: 1,
    name: 'North Goa',
    id: 'north-goa',
    candidates: [
      { name: 'Shripad Yesso Naik', party: 'bjp', votes: 257326, share: 56.43 },
      { name: 'Ramakant Khalap', party: 'inc', votes: 141311, share: 30.99 },
      { name: 'Manoj Parab', party: 'rgp', votes: 45693, share: 10.02 },
      { name: 'Milan Vaingankar', party: 'bsp', votes: 1625, share: 0.36 },
    ],
  },
  {
    no: 2,
    name: 'South Goa',
    id: 'south-goa',
    candidates: [
      { name: 'Viriato Fernandes', party: 'inc', votes: 217836, share: 48.35 },
      { name: 'Pallavi Dempo', party: 'bjp', votes: 204301, share: 45.35 },
      { name: 'Rubert Pereira', party: 'rgp', votes: 18885, share: 4.19 },
    ],
  },
]

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function outcomeForRank(rank: number): ElectionOutcome {
  if (rank === 0) return 'won'
  if (rank === 1) return 'runner_up'
  return 'contested'
}

/** Candidate built from a scraped affidavit record, with optional result overlay. */
function fromScraped(
  id: string,
  scraped: ScrapedCandidate,
  outcome: ElectionOutcome,
  result?: RawCandidate,
): Candidate {
  return {
    id: '',
    name: scraped.name,
    party: resolveParty(scraped.party ?? result?.party),
    constituencyId: id,
    outcome,
    votes: result?.votes,
    voteSharePct: result?.share,
    ...scraped.fields,
    provenance: AFFIDAVIT_PROVENANCE,
  }
}

/** Candidate built from a curated result only (no affidavit match found). */
function fromResult(
  id: string,
  raw: RawCandidate,
  outcome: ElectionOutcome,
  provenance: DataProvenance,
): Candidate {
  return {
    id: '',
    name: raw.name,
    party: resolveParty(raw.party),
    constituencyId: id,
    outcome,
    votes: raw.votes,
    voteSharePct: raw.share,
    provenance,
  }
}

const OUTCOME_ORDER: Record<ElectionOutcome, number> = {
  won: 0,
  runner_up: 1,
  contested: 2,
}

/**
 * Build a seat's full candidate list: every scraped contestant, with the
 * curated winner/runner-up result (outcome + votes) overlaid by name match.
 * Lok Sabha seats have no scraped roster, so they fall back to the curated
 * candidates alone.
 */
function buildSeat(
  seat: RawSeat,
  house: Constituency['house'],
  electionYear: number,
  provenance: DataProvenance,
): { constituency: Constituency; candidates: Candidate[] } {
  const id = seat.id ?? slug(seat.name)
  const roster = rosterFor(seat.name)
  const used = new Set<ScrapedCandidate>()
  const candidates: Candidate[] = []

  // 1. Curated results first (winner, runner-up, …), enriched from the roster.
  seat.candidates.forEach((raw, rank) => {
    const outcome = outcomeForRank(rank)
    const scraped = matchByName(roster, raw.name)
    if (scraped) {
      used.add(scraped)
      candidates.push(fromScraped(id, scraped, outcome, raw))
    } else {
      candidates.push(fromResult(id, raw, outcome, provenance))
    }
  })

  // 2. The rest of the field — every other scraped contestant.
  for (const scraped of roster) {
    if (!used.has(scraped)) {
      candidates.push(fromScraped(id, scraped, 'contested'))
    }
  }

  // 3. Order: winner, runner-up, then the rest by declared assets (desc).
  candidates.sort(
    (a, b) =>
      OUTCOME_ORDER[a.outcome ?? 'contested'] -
        OUTCOME_ORDER[b.outcome ?? 'contested'] ||
      (b.finances?.totalAssets ?? -1) - (a.finances?.totalAssets ?? -1),
  )
  candidates.forEach((c, i) => {
    c.id = `${id}-${i}`
  })

  return {
    constituency: { id, name: seat.name, number: seat.no, state: STATE, house, electionYear },
    candidates,
  }
}

function buildSeats(
  seats: RawSeat[],
  house: Constituency['house'],
  electionYear: number,
  provenance: DataProvenance,
): { constituencies: Constituency[]; candidates: Candidate[] } {
  const constituencies: Constituency[] = []
  const candidates: Candidate[] = []
  for (const seat of seats) {
    const built = buildSeat(seat, house, electionYear, provenance)
    constituencies.push(built.constituency)
    candidates.push(...built.candidates)
  }
  return { constituencies, candidates }
}

const assembly = buildSeats(
  ASSEMBLY_SEATS,
  'Vidhan Sabha',
  2022,
  ASSEMBLY_PROVENANCE,
)
const loksabha = buildSeats(
  LOKSABHA_SEATS,
  'Lok Sabha',
  2024,
  LOKSABHA_PROVENANCE,
)

export const GOA_CONSTITUENCIES: Constituency[] = [
  ...loksabha.constituencies,
  ...assembly.constituencies,
]

export const GOA_CANDIDATES: Candidate[] = [
  ...loksabha.candidates,
  ...assembly.candidates,
]
