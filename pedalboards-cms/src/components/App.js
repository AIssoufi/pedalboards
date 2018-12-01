// Dependencies
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

// CSS
import './App.css';

// Components
import {
  Plugins,
  PedalboardDetails
} from 'components/containers';

class App extends Component {
  render() {
    return (
      <Router>
        <main className="main-container">
          <Switch>
            <Route exact path="/plugins" component={Plugins} />
            <Route exact path="/plugin/:id" component={PedalboardDetails} />
            <Redirect to="/plugins" />
          </Switch>
        </main>
      </Router>
    );
  }
}

export default App;
