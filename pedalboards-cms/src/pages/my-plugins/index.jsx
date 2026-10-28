// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Components
import { Pagination, RequestError } from 'components';

// Utils
import { Env } from 'utils';
import { toPluginActionLabel } from './utils';

// Hooks
import usePluginList from './hooks/usePluginList';

// Constants
import {
  ADD_PLUGIN_TEXT, DELETE_ACTION, EDIT_ACTION, EMPTY_STATE_TEXT, PAGE_TITLE, VIEW_ACTION
} from './constants';

// Style
import './style.scss';

/**
 * Page that lists the plugins, `PAGE_SIZE` per page, with links to edit them and a button to delete
 * them. The search of the address filters the list, and a new search reloads it from the first
 * page.
 */
const MyPlugins = ({ location = {} }) => {
  const homePageUrl = Env.get('frontend');
  const { search = '' } = location;
  const {
    plugins, currentPage, pageCount, errorMessage, goToPage, deletePlugin
  } = usePluginList({ search });
  const hasPlugins = Array.isArray(plugins) && plugins.length > 0;

  return (
    <section className="my-plugin-container">
      <header>
        <h1>{PAGE_TITLE}</h1>
        <Link
          to="/plugin/add"
          className="btn bg-primary"
        >
          {ADD_PLUGIN_TEXT}
        </Link>
      </header>
      <RequestError message={errorMessage} />
      <div className="content">
        {hasPlugins
          ? plugins.map(({ _id, name }) => (
            <div className="plugin" key={_id}>
              <h2 className="title">{name}</h2>
              <div className="controls">
                <a
                  href={`${homePageUrl}/plugin/${_id}`}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="btn bg-white"
                  aria-label={toPluginActionLabel({
                    action: VIEW_ACTION, pluginName: name, opensInNewTab: true
                  })}
                >
                  {VIEW_ACTION}

                </a>
                <Link
                  to={`plugin/edit/${_id}`}
                  className="btn bg-white"
                  aria-label={toPluginActionLabel({ action: EDIT_ACTION, pluginName: name })}
                >
                  {EDIT_ACTION}
                </Link>
                <button
                  type="button"
                  className="btn bg-white"
                  aria-label={toPluginActionLabel({ action: DELETE_ACTION, pluginName: name })}
                  onClick={() => deletePlugin(_id)}
                >
                  {DELETE_ACTION}
                </button>
              </div>
            </div>))
          : <p>{EMPTY_STATE_TEXT}</p>
        }
      </div>
      <footer>
        <Pagination
          currentPage={currentPage}
          elementCount={pageCount}
          onCurrentPageChange={goToPage}
        />
      </footer>
    </section>
  );
};

MyPlugins.propTypes = {
  /**
   * Address of the page, given by the router: its `search` filters the plugins, as `?name=gate`.
   * @default {}
   */
  location: PropTypes.shape({
    search: PropTypes.string
  })
};

export default MyPlugins;
