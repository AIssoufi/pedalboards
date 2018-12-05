// Dependencies
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

// CSS
import './App.scss';

// Components
import {
  Header,
  MyPlugins
} from 'components/containers';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="app-wrapper">
          <Header />
          <main className="main-container">
            <Switch>
              <Route exact path="/my-plugins" component={MyPlugins} />
              <Redirect to="/my-plugins" />
            </Switch>
          </main>
        </div>
      </Router>
    );
  }
}

export default App;
