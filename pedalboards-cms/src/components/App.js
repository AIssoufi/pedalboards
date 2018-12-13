// Dependencies
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

// CSS
import './App.scss';

// Components
import {
  EditPlugin,
  Header,
  MyPlugins
} from 'components/containers';
import {
  AddPlugin,
} from 'components/presentationals';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="app-wrapper">
          <Header />
          <main className="main-container">
            <Switch>
              <Route exact path="/plugins" component={MyPlugins} />
              <Route exact path="/plugin/add" component={AddPlugin} />
              <Route exact path="/plugin/edit/:id" component={EditPlugin} />
              <Redirect to="/plugins" />
            </Switch>
          </main>
        </div>
      </Router>
    );
  }
}

export default App;
