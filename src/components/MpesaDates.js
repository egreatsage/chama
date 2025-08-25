/**
 * Converts an M-Pesa timestamp (YYYYMMDDHHMMSS) to a formatted date string.
 * @param {string} mpesaDate The date string from the M-Pesa callback.
 * @returns {string} A formatted date like "Aug 23, 2025, 5:56 PM".
 */
const formatMpesaDate = (mpesaDate) => {
  if (!mpesaDate || mpesaDate.length !== 14) {
    return "Invalid Date";
  }

  // Extract parts of the date string
  const year = mpesaDate.substring(0, 4);
  const month = mpesaDate.substring(4, 6);
  const day = mpesaDate.substring(6, 8);
  const hour = mpesaDate.substring(8, 10);
  const minute = mpesaDate.substring(10, 12);
  const second = mpesaDate.substring(12, 14);

  // Create a Date object (Note: month is 0-indexed in JavaScript)
  const date = new Date(year, month - 1, day, hour, minute, second);

  // Format it for display
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default formatMpesaDate;