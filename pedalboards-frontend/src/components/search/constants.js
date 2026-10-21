/** Pause of the typing in the text field after which the search submits, in milliseconds. */
export const SEARCH_DEBOUNCE_MS = 900;

/**
 * Fields of a plugin that the select of the form searches in, with the text of their option.
 */
export const SEARCH_FIELD_OPTIONS = [
  { value: 'brand', label: 'brand' },
  { value: 'categories', label: 'categorie' },
  { value: 'label', label: 'lebel' }
];

/** Field the select shows when the URL filters on none of SEARCH_FIELD_OPTIONS. */
export const DEFAULT_SEARCH_FIELD = 'brand';
