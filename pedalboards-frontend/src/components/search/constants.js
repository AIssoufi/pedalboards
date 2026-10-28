/** Name of the text field, read by screen readers and shown while it is empty. */
export const SEARCH_TEXT_NAME = 'Search Plugins';

/** Name of the submit button, which shows only an icon, read by screen readers. */
export const SEARCH_BUTTON_NAME = 'Search';

/** Pause of the typing in the text field after which the search submits, in milliseconds. */
export const SEARCH_DEBOUNCE_MS = 900;

/**
 * Fields of a plugin that the select of the form searches in, with the text of their option.
 */
export const SEARCH_FIELD_OPTIONS = [
  { value: 'name', label: 'name' },
  { value: 'brand', label: 'brand' },
  { value: 'categories', label: 'category' },
  { value: 'label', label: 'label' }
];

/** Field the select shows when the URL filters on none of SEARCH_FIELD_OPTIONS. */
export const DEFAULT_SEARCH_FIELD = 'name';
