// Dependencies
import { Fragment } from 'react';
import {
  BrowserRouter, Navigate, Route, Routes
} from 'react-router';

// Components
import {
  Plugins,
  PedalboardDetails
} from '../pages';

import {
  Header
} from '.';

// Constants
import { ANY_OTHER_ROUTE, PLUGIN_DETAILS_ROUTE, PLUGINS_PATHNAME } from '../constants/routes';

// Style
import './App.css';

/**
 * Root component of the app: the router, the header shown on every page and the main area with
 * its routes. `/plugins` lists the plugins, `/plugin/:id` shows the details of one, and any other
 * path redirects to `/plugins`. Must be rendered inside a react-redux `<Provider>`, since its pages
 * read the store; it provides the router itself.
 */
const App = () => (
  <BrowserRouter>
    <Fragment>
      <Header />
      <main className="main-container">
        <Routes>
          <Route path={PLUGINS_PATHNAME} element={<Plugins />} />
          <Route path={PLUGIN_DETAILS_ROUTE} element={<PedalboardDetails />} />
          <Route path={ANY_OTHER_ROUTE} element={<Navigate to={PLUGINS_PATHNAME} replace />} />
        </Routes>
      </main>
    </Fragment>
  </BrowserRouter>
);

export default App;
