// Dependencies
import React, { Fragment } from 'react';
import {
  BrowserRouter as Router, Route, Switch, Redirect
} from 'react-router-dom';

// Components
import {
  Plugins,
  PedalboardDetails
} from 'pages';

import {
  Header
} from 'components';

// Style
import './App.css';

const App = () => (
  <Router>
    <Fragment>
      <Header />
      <main className="main-container">
        <Switch>
          <Route exact path="/plugins" component={Plugins} />
          <Route exact path="/plugin/:id" component={PedalboardDetails} />
          <Redirect to="/plugins" />
        </Switch>
      </main>
    </Fragment>
  </Router>
);

export default App;
