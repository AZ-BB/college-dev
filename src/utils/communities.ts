/**
 * Format member count for display (e.g., 1200 -> 1.2K, 120000 -> 120K)
 */
export function formatMemberCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K`
  }
  return count.toString()
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = "INR"): string {
  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  }

  const symbol = currencySymbols[currency] || currency
  return `${symbol}${price}/month`
}
