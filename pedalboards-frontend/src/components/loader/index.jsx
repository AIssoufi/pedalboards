// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// Styles
import './style.scss';

const Loader = () => (
  <div className="loader-container">
    <div>
      <FontAwesomeIcon icon={faSpinner} spin size="6x" />
      <p>Je Fais ça En Deux Deux...</p>
    </div>
  </div>
);

export default Loader;
