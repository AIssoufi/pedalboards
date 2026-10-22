// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// Styles
import './style.scss';

/**
 * Spinner with a waiting text, shown in place of content that loads. Its text is in French, so it
 * carries its own language inside the English page.
 */
const Loader = () => (
  <div className="loader-container">
    <div>
      <FontAwesomeIcon icon={faSpinner} spin size="6x" />
      <p lang="fr">Je Fais ça En Deux Deux...</p>
    </div>
  </div>
);

export default Loader;
