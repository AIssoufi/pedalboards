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
        <main className="main-container">
          <Switch>
            <Route exact path="/plugins" component={PluginsPage} />
            <Route path="/plugin/:id" component={PedalboardDetailsPage} />
            <Redirect to="/plugins" />
          </Switch>
        </main>
      </Router>
    );
  }
}

export default App;
