import type { Party } from '../domain/types'

/** Small coloured chip showing a party's abbreviation. */
export default function PartyChip({ party }: { party: Party }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: party.color ?? '#6b7280' }}
      title={party.name}
    >
      {party.abbreviation}
    </span>
  )
}
