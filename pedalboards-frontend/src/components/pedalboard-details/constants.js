/**
 * Formats the numbers of the control ports table: the API stores them with 32-bit precision
 * (0.10000000149011612 for 0.1), so they are rounded to 4 decimals, without thousands separators.
 */
export const CELL_NUMBER_FORMAT = new Intl.NumberFormat('en', {
  maximumFractionDigits: 4,
  useGrouping: false
});

/** Text the formatter gives to a negative number that rounds to zero, such as -0.00001. */
export const NEGATIVE_ZERO_TEXT = '-0';
