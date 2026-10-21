// Pure helpers of the bundle check

/**
 * Tells whether a marker can be searched: a blank one would match every file.
 *
 * @param {unknown} marker
 * @returns {boolean} True for a string holding more than spaces.
 */
const isSearchable = marker => typeof marker === 'string' && marker.trim() !== '';

/**
 * @typedef {Object} BundleFile
 * @property {string} name - Name of the file, shown in the report.
 * @property {string} contents - Text of the file.
 */

/**
 * @typedef {Object} FindMarkersParams
 * @property {BundleFile[]} [files] - Script files of the build.
 * @property {string[]} [markers] - Pieces of code that may not ship.
 */

/**
 * @typedef {Object} FoundMarker
 * @property {string} file - Name of the file that holds the marker.
 * @property {string} marker - The marker found.
 */

/**
 * Lists each marker found in each file, in the order of the files, then of the markers.
 *
 * @param {FindMarkersParams | null} [params]
 * @returns {FoundMarker[]} Empty when no file holds a marker, or when files or markers are not
 * lists. Blank markers and files without text are skipped, since a blank marker would match
 * every file.
 */
export const findMarkers = params => {
  const { files, markers } = params ?? {};
  const searchedFiles = Array.isArray(files) ? files : [];
  const searchedMarkers = Array.isArray(markers) ? markers.filter(isSearchable) : [];

  return searchedFiles.flatMap(file => {
    const { name, contents } = file ?? {};
    const hasText = typeof contents === 'string';

    if (!hasText) {
      return [];
    }

    return searchedMarkers
      .filter(marker => contents.includes(marker))
      .map(marker => ({ file: name, marker }));
  });
};
