/**
 * Periscope data pipeline — MyNeta affidavit scraper (Goa 2022 Assembly).
 *
 * Pages through MyNeta's "candidates analysed" summary listing and extracts each
 * candidate's affidavit summary: party, constituency, declared criminal-case
 * count, highest education, total assets and total liabilities. Writes a flat
 * JSON file under pipeline/output/.
 *
 * SOURCE & TERMS: data is compiled by the Association for Democratic Reforms
 * (ADR) / MyNeta from candidates' Form 26 affidavits filed with the ECI. ADR's
 * Terms discourage automated collection / redistribution. This script is a
 * LOCAL prototype that fetches a modest number of public pages, politely
 * (sequential, throttled). For production, obtain ADR's permission or rebuild
 * from the primary ECI affidavit archive. Attribute ADR/MyNeta on any display.
 *
 * Usage:  node pipeline/scrape-myneta-goa.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises'

const BASE = 'https://www.myneta.info/goa2022'
const LIST = (page) =>
  `${BASE}/index.php?action=summary&subAction=candidates_analyzed&sort=candidate&page=${page}`
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
const DELAY_MS = 1200
const MAX_PAGES = 30

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const clean = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** "Rs 28,23,29,390 ~ 28 Crore+" -> 282329390 ; "Rs 0 ~" -> 0 */
function parseRupees(cell) {
  const m = cell.match(/Rs\s*([0-9,]+)/i)
  if (!m) return null
  return Number(m[1].replace(/,/g, ''))
}

const PARTY_CODE = (raw) => {
  const s = raw.toLowerCase()
  if (/bharatiya janata|\bbjp\b/.test(s)) return 'bjp'
  if (/indian national congress|\binc\b/.test(s)) return 'inc'
  if (/aam aadmi|\baap\b/.test(s)) return 'aap'
  if (/maharashtrawadi|\bmgp\b/.test(s)) return 'mgp'
  if (/goa forward|\bgfp\b/.test(s)) return 'gfp'
  if (/revolutionary goans|\brgp\b/.test(s)) return 'rgp'
  if (/trinamool|\baitc\b|\btmc\b/.test(s)) return 'aitc'
  if (/bahujan samaj|\bbsp\b/.test(s)) return 'bsp'
  if (/independent|\bind\b/.test(s)) return 'ind'
  return 'other'
}

/** Extract candidate rows from one listing page. */
function parseRows(html) {
  const rows = []
  for (const tr of html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []) {
    if (!/candidate_id=/.test(tr)) continue
    const id = (tr.match(/candidate_id=(\d+)/) || [])[1]
    const cells = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      clean(m[1]),
    )
    if (cells.length < 8) continue
    // [0]=Sl [1]=Name [2]=Constituency [3]=Party [4]=Criminal [5]=Education [6]=Assets [7]=Liabilities
    const criminalCases = Number((cells[4].match(/\d+/) || [0])[0])
    rows.push({
      mynetaId: id,
      name: cells[1],
      constituency: cells[2],
      party: cells[3],
      partyCode: PARTY_CODE(cells[3]),
      criminalCases,
      education: cells[5],
      totalAssets: parseRupees(cells[6]),
      totalLiabilities: parseRupees(cells[7]),
      sourceUrl: `${BASE}/candidate.php?candidate_id=${id}`,
    })
  }
  return rows
}

async function fetchPage(page) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(LIST(page), { headers: { 'User-Agent': UA } })
      if (res.ok) return res.text()
      console.warn(`  page ${page}: HTTP ${res.status} (attempt ${attempt})`)
    } catch (e) {
      console.warn(`  page ${page}: ${e.message} (attempt ${attempt})`)
    }
    await sleep(DELAY_MS * attempt)
  }
  return null
}

async function main() {
  const all = []
  const seen = new Set()
  for (let page = 1; page <= MAX_PAGES; page++) {
    const html = await fetchPage(page)
    if (!html) break
    const rows = parseRows(html).filter((r) => {
      if (seen.has(r.mynetaId)) return false
      seen.add(r.mynetaId)
      return true
    })
    console.log(`page ${page}: +${rows.length} candidates (total ${all.length + rows.length})`)
    if (rows.length === 0) break
    all.push(...rows)
    await sleep(DELAY_MS)
  }

  all.sort((a, b) =>
    a.constituency.localeCompare(b.constituency) || a.name.localeCompare(b.name),
  )

  const out = {
    source: 'ADR / MyNeta (myneta.info/goa2022) — compiled from ECI Form 26 affidavits',
    election: { state: 'Goa', house: 'Vidhan Sabha', year: 2022 },
    scrapedAt: new Date().toISOString(),
    note: 'Affidavit summary per candidate. Amounts in INR. Attribute ADR/MyNeta on display.',
    count: all.length,
    candidates: all,
  }
  await mkdir(new URL('./output/', import.meta.url), { recursive: true })
  const path = new URL('./output/goa-2022-affidavits.json', import.meta.url)
  await writeFile(path, JSON.stringify(out, null, 2))
  console.log(`\n✓ wrote ${all.length} candidates → pipeline/output/goa-2022-affidavits.json`)
  const withCrime = all.filter((c) => c.criminalCases > 0).length
  console.log(`  ${withCrime} have ≥1 declared criminal case; ${all.length - withCrime} have none`)
}

main()
