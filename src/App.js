// Dependencies
import React, { Component } from 'react';

// CSS
import './App.css';

// Components
import PluginsPage from './components/plugins-page/plugins-page';

class App extends Component {
  render() {
    return (
      <div className="App">
        <PluginsPage />
      </div>
    );
  }
}

export default App;
