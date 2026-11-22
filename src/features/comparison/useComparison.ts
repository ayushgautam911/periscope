import { candidateRepository } from '../../data'
import type { Candidate, Constituency } from '../../domain/types'
import { useAsync } from '../../hooks/useAsync'

export interface ComparisonData {
  constituency: Constituency | null
  candidates: Candidate[]
}

/**
 * Loads the constituency and its candidates together. The component only sees
 * loading / error / data — it never knows or cares where the data came from.
 */
export function useComparison(stateId: string, constituencyId: string) {
  return useAsync<ComparisonData>(async () => {
    const [constituency, candidates] = await Promise.all([
      candidateRepository.getConstituency(stateId, constituencyId),
      candidateRepository.getCandidatesByConstituency(stateId, constituencyId),
    ])
    return { constituency, candidates }
  }, [stateId, constituencyId])
}
