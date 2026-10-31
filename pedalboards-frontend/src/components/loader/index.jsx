// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// Styles
import './style.scss';

// Waiting text under the spinner
const LOADER_TEXT = 'Loading...';

/**
 * Spinner with a waiting text, shown in place of content that loads. Exposes the waiting as a
 * status for assistive technologies.
 */
const Loader = () => (
  <div className="loader-container" role="status">
    <div>
      <FontAwesomeIcon icon={faSpinner} spin size="6x" widthAuto />
      <p>{LOADER_TEXT}</p>
    </div>
  </div>
);

export default Loader;
