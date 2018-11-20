// Dependencies
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

// CSS
import './App.css';

// Components
import PluginsPage from './pages/plugins/plugins.page';
import PedalboardDetailsPage from './pages/pedalboard-details/pedalboard-details.page';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/plugins" component={PluginsPage} />
          <Route path="/pedalboard/details" component={PedalboardDetailsPage} />
          <Redirect to="/plugins" />
        </Switch>
      </Router>
    );
  }
}

export default App;
