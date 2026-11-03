// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Components
import { Pagination, RequestError } from 'components';
import PluginItem from './plugin-item';

// Utils
import { Env } from 'utils';

// Hooks
import usePluginList from './hooks/usePluginList';

// Constants
import { ADD_PLUGIN_TEXT, EMPTY_STATE_TEXT, PAGE_TITLE } from './constants';

// Style
import './style.scss';

/**
 * Page that lists the plugins, `PAGE_SIZE` per page, with links to edit them and a button to delete
 * them. Each plugin shows its label, which the API sorts the list on, with its name below. The
 * search of the address filters the list, and a new search reloads it from the first page.
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
          ? plugins.map(({ _id, label, name }) => (
            <PluginItem
              key={_id}
              id={_id}
              label={label}
              name={name}
              homePageUrl={homePageUrl}
              onDelete={deletePlugin}
            />))
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
