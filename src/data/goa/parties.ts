/**
 * Goa party registry: national parties plus Goa's regional ones, resolved via
 * the shared factory (see ../partyResolver.ts).
 */

import type { Party } from '../../domain/types'
import { createPartyResolver, NATIONAL_PARTIES } from '../partyResolver'

const GOA_PARTIES: Record<string, Party> = {
  mgp: { id: 'mgp', name: 'Maharashtrawadi Gomantak Party', abbreviation: 'MGP', color: '#e11d48' },
  gfp: { id: 'gfp', name: 'Goa Forward Party', abbreviation: 'GFP', color: '#f59e0b' },
  rgp: { id: 'rgp', name: 'Revolutionary Goans Party', abbreviation: 'RGP', color: '#7c3aed' },
}

const GOA_ALIASES: Record<string, string> = {
  gfp: 'gfp', goaforwardparty: 'gfp',
  rgp: 'rgp', revolutionarygoans: 'rgp', revolutionarygoansparty: 'rgp',
  mgp: 'mgp', maharashtrawadigomantak: 'mgp', maharashtrawadigomantakparty: 'mgp',
}

export const PARTIES: Record<string, Party> = {
  ...NATIONAL_PARTIES,
  ...GOA_PARTIES,
}

export const resolveParty = createPartyResolver(GOA_PARTIES, GOA_ALIASES)
