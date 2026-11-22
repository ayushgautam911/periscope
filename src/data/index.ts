/**
 * Single swap-point for the app's data source.
 *
 * The entire app imports `candidateRepository` from here. Each state's dataset
 * is a separate lazily-imported chunk: opening a Bihar page never downloads
 * UP's 1.8 MB of candidates. Adding a state = one loader entry here plus a
 * `states.ts` entry.
 */

import type { Candidate, Constituency } from '../domain/types'
import { findLeader } from '../domain/types'
import type { CandidateRepository, ConstituencySummary } from './repository'

interface StateData {
  constituencies: Constituency[]
  candidates: Candidate[]
}

const loaders: Record<string, () => Promise<StateData>> = {
  goa: () =>
    import('./goa/goaData').then((m) => ({
      constituencies: m.GOA_CONSTITUENCIES,
      candidates: m.GOA_CANDIDATES,
    })),
  delhi: () =>
    import('./delhi/delhiData').then((m) => ({
      constituencies: m.DELHI_CONSTITUENCIES,
      candidates: m.DELHI_CANDIDATES,
    })),
  bihar: () =>
    import('./bihar/biharData').then((m) => ({
      constituencies: m.BIHAR_CONSTITUENCIES,
      candidates: m.BIHAR_CANDIDATES,
    })),
  'uttar-pradesh': () =>
    import('./up/upData').then((m) => ({
      constituencies: m.UP_CONSTITUENCIES,
      candidates: m.UP_CANDIDATES,
    })),
  'arunachal-pradesh': () =>
    import('./arunachal/arunachalData').then((m) => ({
      constituencies: m.ARUNACHAL_CONSTITUENCIES,
      candidates: m.ARUNACHAL_CANDIDATES,
    })),
  kerala: () =>
    import('./kerala/keralaData').then((m) => ({
      constituencies: m.KERALA_CONSTITUENCIES,
      candidates: m.KERALA_CANDIDATES,
    })),
  gujarat: () =>
    import('./gujarat/gujaratData').then((m) => ({
      constituencies: m.GUJARAT_CONSTITUENCIES,
      candidates: m.GUJARAT_CANDIDATES,
    })),
  sikkim: () =>
    import('./sikkim/sikkimData').then((m) => ({
      constituencies: m.SIKKIM_CONSTITUENCIES,
      candidates: m.SIKKIM_CANDIDATES,
    })),
  mizoram: () =>
    import('./mizoram/mizoramData').then((m) => ({
      constituencies: m.MIZORAM_CONSTITUENCIES,
      candidates: m.MIZORAM_CANDIDATES,
    })),
  nagaland: () =>
    import('./nagaland/nagalandData').then((m) => ({
      constituencies: m.NAGALAND_CONSTITUENCIES,
      candidates: m.NAGALAND_CANDIDATES,
    })),
  manipur: () =>
    import('./manipur/manipurData').then((m) => ({
      constituencies: m.MANIPUR_CONSTITUENCIES,
      candidates: m.MANIPUR_CANDIDATES,
    })),
  tripura: () =>
    import('./tripura/tripuraData').then((m) => ({
      constituencies: m.TRIPURA_CONSTITUENCIES,
      candidates: m.TRIPURA_CANDIDATES,
    })),
  puducherry: () =>
    import('./puducherry/puducherryData').then((m) => ({
      constituencies: m.PUDUCHERRY_CONSTITUENCIES,
      candidates: m.PUDUCHERRY_CANDIDATES,
    })),
  meghalaya: () =>
    import('./meghalaya/meghalayaData').then((m) => ({
      constituencies: m.MEGHALAYA_CONSTITUENCIES,
      candidates: m.MEGHALAYA_CANDIDATES,
    })),
  'himachal-pradesh': () =>
    import('./himachal/himachalData').then((m) => ({
      constituencies: m.HIMACHAL_CONSTITUENCIES,
      candidates: m.HIMACHAL_CANDIDATES,
    })),
  uttarakhand: () =>
    import('./uttarakhand/uttarakhandData').then((m) => ({
      constituencies: m.UTTARAKHAND_CONSTITUENCIES,
      candidates: m.UTTARAKHAND_CANDIDATES,
    })),
  karnataka: () =>
    import('./karnataka/karnatakaData').then((m) => ({
      constituencies: m.KARNATAKA_CONSTITUENCIES,
      candidates: m.KARNATAKA_CANDIDATES,
    })),
  maharashtra: () =>
    import('./maharashtra/maharashtraData').then((m) => ({
      constituencies: m.MAHARASHTRA_CONSTITUENCIES,
      candidates: m.MAHARASHTRA_CANDIDATES,
    })),
  'tamil-nadu': () =>
    import('./tamilnadu/tamilnaduData').then((m) => ({
      constituencies: m.TAMILNADU_CONSTITUENCIES,
      candidates: m.TAMILNADU_CANDIDATES,
    })),
  'west-bengal': () =>
    import('./westbengal/westbengalData').then((m) => ({
      constituencies: m.WESTBENGAL_CONSTITUENCIES,
      candidates: m.WESTBENGAL_CANDIDATES,
    })),
  rajasthan: () =>
    import('./rajasthan/rajasthanData').then((m) => ({
      constituencies: m.RAJASTHAN_CONSTITUENCIES,
      candidates: m.RAJASTHAN_CANDIDATES,
    })),
  'madhya-pradesh': () =>
    import('./madhyapradesh/madhyapradeshData').then((m) => ({
      constituencies: m.MADHYAPRADESH_CONSTITUENCIES,
      candidates: m.MADHYAPRADESH_CANDIDATES,
    })),
  chhattisgarh: () =>
    import('./chhattisgarh/chhattisgarhData').then((m) => ({
      constituencies: m.CHHATTISGARH_CONSTITUENCIES,
      candidates: m.CHHATTISGARH_CANDIDATES,
    })),
  odisha: () =>
    import('./odisha/odishaData').then((m) => ({
      constituencies: m.ODISHA_CONSTITUENCIES,
      candidates: m.ODISHA_CANDIDATES,
    })),
  haryana: () =>
    import('./haryana/haryanaData').then((m) => ({
      constituencies: m.HARYANA_CONSTITUENCIES,
      candidates: m.HARYANA_CANDIDATES,
    })),
  punjab: () =>
    import('./punjab/punjabData').then((m) => ({
      constituencies: m.PUNJAB_CONSTITUENCIES,
      candidates: m.PUNJAB_CANDIDATES,
    })),
  jharkhand: () =>
    import('./jharkhand/jharkhandData').then((m) => ({
      constituencies: m.JHARKHAND_CONSTITUENCIES,
      candidates: m.JHARKHAND_CANDIDATES,
    })),
  telangana: () =>
    import('./telangana/telanganaData').then((m) => ({
      constituencies: m.TELANGANA_CONSTITUENCIES,
      candidates: m.TELANGANA_CANDIDATES,
    })),
  'andhra-pradesh': () =>
    import('./andhrapradesh/andhrapradeshData').then((m) => ({
      constituencies: m.ANDHRAPRADESH_CONSTITUENCIES,
      candidates: m.ANDHRAPRADESH_CANDIDATES,
    })),
  assam: () =>
    import('./assam/assamData').then((m) => ({
      constituencies: m.ASSAM_CONSTITUENCIES,
      candidates: m.ASSAM_CANDIDATES,
    })),
  'jammu-kashmir': () =>
    import('./jammukashmir/jammukashmirData').then((m) => ({
      constituencies: m.JANDK_CONSTITUENCIES,
      candidates: m.JANDK_CANDIDATES,
    })),
}

const loaded = new Map<string, Promise<StateData>>()

function load(stateId: string): Promise<StateData> {
  const loader = loaders[stateId]
  if (!loader) return Promise.resolve({ constituencies: [], candidates: [] })
  let p = loaded.get(stateId)
  if (!p) {
    p = loader()
    loaded.set(stateId, p)
  }
  return p
}

class LazyStateRepository implements CandidateRepository {
  async listConstituencySummaries(
    stateId: string,
  ): Promise<ConstituencySummary[]> {
    const { constituencies, candidates } = await load(stateId)
    return constituencies.map((constituency) => ({
      constituency,
      leader: findLeader(
        candidates.filter((c) => c.constituencyId === constituency.id),
      ),
    }))
  }

  async getConstituency(
    stateId: string,
    constituencyId: string,
  ): Promise<Constituency | null> {
    const { constituencies } = await load(stateId)
    return constituencies.find((c) => c.id === constituencyId) ?? null
  }

  async getCandidatesByConstituency(
    stateId: string,
    constituencyId: string,
  ): Promise<Candidate[]> {
    const { candidates } = await load(stateId)
    return candidates.filter((c) => c.constituencyId === constituencyId)
  }
}

export const candidateRepository: CandidateRepository =
  new LazyStateRepository()

/** True while the active repository serves illustrative, non-real data. */
export const USING_SAMPLE_DATA = false

/** A short disclosure shown in the header banner, or `null` to hide it. */
export const DATA_NOTICE: string | null = null

export type { CandidateRepository, ConstituencySummary } from './repository'
