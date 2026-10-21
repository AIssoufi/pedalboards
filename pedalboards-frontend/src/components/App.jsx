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

// Style
import './App.css';

const App = () => (
  <BrowserRouter>
    <Fragment>
      <Header />
      <main className="main-container">
        <Routes>
          <Route path="/plugins" element={<Plugins />} />
          <Route path="/plugin/:id" element={<PedalboardDetails />} />
          <Route path="*" element={<Navigate to="/plugins" replace />} />
        </Routes>
      </main>
    </Fragment>
  </BrowserRouter>
);

export default App;
