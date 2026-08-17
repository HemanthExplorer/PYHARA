/**
 * PYHARA — Indian Rupee Currency Formatting Utility
 * 
 * Formats monetary amounts into Indian standard currency format:
 * - 499 -> "₹499"
 * - 1299 -> "₹1,299"
 * - 125000 -> "₹1,25,000"
 * - null / undefined / NaN -> fallback (default: "Price coming soon")
 */

export function formatCurrency(amount, fallback = 'Price coming soon') {
  if (amount === null || amount === undefined || amount === '') {
    return fallback;
  }

  const num = Number(amount);
  if (isNaN(num)) {
    return fallback;
  }

  const isWhole = num % 1 === 0;

  try {
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(num);

    return `₹${formattedNumber}`;
  } catch (err) {
    return `₹${num.toFixed(isWhole ? 0 : 2)}`;
  }
}

export function formatTotalCurrency(amount, fallback = 'Total will be confirmed') {
  return formatCurrency(amount, fallback);
}
