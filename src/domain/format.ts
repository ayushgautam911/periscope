/**
 * Presentation helpers for domain values. Pure functions, no React — so they're
 * trivially unit-testable and reusable across web and the future Capacitor app.
 */

const CRORE = 10_000_000
const LAKH = 100_000

/**
 * Formats an INR amount the way Indian readers expect: crore / lakh.
 *   123456789 -> "₹12.35 Cr"
 *      550000 -> "₹5.50 Lakh"
 *        4200 -> "₹4,200"
 */
export function formatINR(amount: number): string {
  if (amount <= 0) return '₹0'
  if (amount >= CRORE) return `₹${(amount / CRORE).toFixed(2)} Cr`
  if (amount >= LAKH) return `₹${(amount / LAKH).toFixed(2)} Lakh`
  return `₹${amount.toLocaleString('en-IN')}`
}

/** "42 yrs" */
export function formatAge(age: number): string {
  return `${age} yrs`
}

/** Pluralise a count: pluralize(1, "case") -> "1 case". */
export function pluralize(
  count: number,
  noun: string,
  plural?: string,
): string {
  const word = count === 1 ? noun : (plural ?? `${noun}s`)
  return `${count} ${word}`
}
