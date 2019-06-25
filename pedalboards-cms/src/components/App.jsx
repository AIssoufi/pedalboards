// Dependencies
import React, { Component } from 'react';
import {
 BrowserRouter as Router, Route, Switch, Redirect 
} from 'react-router-dom';

// Style
import './App.scss';

// Components
import {
  EditPlugin,
  Header,
  MyPlugins,
} from 'pages';

import {
  AddPlugin,
} from 'components';

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
