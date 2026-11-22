/**
 * Education levels mirror the categories used in Indian election affidavits
 * (as compiled by ADR). They are ordered so the UI can compare "more vs less"
 * formal education without hardcoding the ordering at each call site.
 */

export const EDUCATION_LEVELS = [
  'Illiterate',
  'Literate',
  '5th Pass',
  '8th Pass',
  '10th Pass',
  '12th Pass',
  'Graduate',
  'Graduate Professional',
  'Post Graduate',
  'Doctorate',
  'Others',
] as const

export type EducationLevel = (typeof EDUCATION_LEVELS)[number]

/**
 * Rank used for ordering. "Others"/"Literate" are intentionally low-but-defined
 * so they never sort above a clear qualification. Returns -1 for unknowns.
 */
export function educationRank(level: EducationLevel): number {
  const index = EDUCATION_LEVELS.indexOf(level)
  // Push the catch-all "Others" to the bottom regardless of array position.
  if (level === 'Others') return -1
  return index
}
