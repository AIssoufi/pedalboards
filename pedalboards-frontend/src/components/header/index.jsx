// Components
import { NavLink, Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faThList } from '@fortawesome/free-solid-svg-icons';

// Utils
import { Env } from '../../utils';
import { getAdminPanelUrl } from './utils';

// Style
import './style.scss';

// The CMS is not deployed with the site: without its address, the header leaves its link out
const ADMIN_PANEL_URL = getAdminPanelUrl(Env.get('backend'));
const HAS_ADMIN_PANEL = ADMIN_PANEL_URL !== null;

const Header = () => (
  <nav className="toolbar whiteframe">
    <div className="toolbar-content">
      <Link to="/" className="mobile-menu-button">
        <span className="icon-bar" />
        <span className="icon-bar" />
        <span className="icon-bar" />
      </Link>
      <div className="toolbar-brand-container">
        <div className="toolbar-brand">
          <a className="logo" href="http://aissoufi.github.io">
            Realised by @aissoufi
          </a>
        </div>
      </div>
      <div className="toolbar-option-container">
        {/* NavLink adds the active class while the URL is under /plugins */}
        <NavLink className="toolbar-option" to="/plugins">
          <FontAwesomeIcon icon={faThList} />
          <span>Plugins</span>
        </NavLink>
        {HAS_ADMIN_PANEL && (
          <a
            className="toolbar-option"
            href={ADMIN_PANEL_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Admin Panel</span>
          </a>
        )}
      </div>
    </div>
  </nav>
);

export default Header;
