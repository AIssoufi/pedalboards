// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// Styles
import './style.scss';

// Waiting text under the spinner
const LOADER_TEXT = 'Loading...';

/**
 * Props of {@link Loader}.
 *
 * @typedef {Object} LoaderProps
 * @property {boolean} [isAnnounced=true] - Exposes the waiting as a status unless `false`, given
 *   by a page whose own status region, kept in the page, already reads the waiting.
 */

/**
 * Spinner with a waiting text, shown in place of content that loads. Exposes the waiting as a
 * status for assistive technologies, unless the page announces it itself.
 *
 * @param {LoaderProps} props - Props of the component.
 */
const Loader = ({ isAnnounced = true }) => {
  // Only an explicit false drops the status, so that a wrong value keeps the announcement
  const isStatus = isAnnounced !== false;

  return (
    <div className="loader-container" role={isStatus ? 'status' : undefined}>
      <div>
        <FontAwesomeIcon icon={faSpinner} spin size="6x" widthAuto />
        <p>{LOADER_TEXT}</p>
      </div>
    </div>
  );
};

export default Loader;
