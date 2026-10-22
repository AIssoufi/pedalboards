// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Components
import { Pagination, RequestError } from 'components';

// Utils
import { Env } from 'utils';

// Hooks
import usePluginList from './hooks/usePluginList';

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

  return (
    <section className="my-plugin-container">
      <header>
        <h1>Mes plugins</h1>
        <Link
          to="/plugin/add"
          className="btn bg-primary"
        >
          Ajouter un  plugin
        </Link>
      </header>
      <RequestError message={errorMessage} />
      <main>
        {plugins && plugins.length > 0
          ? plugins.map(({ _id, name }) => (
            <div className="plugin" key={_id}>
              <h2 className="title">{name}</h2>
              <div className="controls">
                <a
                  href={`${homePageUrl}/plugin/${_id}`}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="btn bg-white"
                >
                  Voir

                </a>
                <Link to={`plugin/edit/${_id}`} className="btn bg-white">Éditer</Link>
                <button
                  type="button"
                  className="btn bg-white"
                  onClick={() => deletePlugin(_id)}
                >
                  Supprimer
                </button>
              </div>
            </div>))
          : <p>Vous n'avez ajouté aucun plugin</p>
        }
      </main>
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
