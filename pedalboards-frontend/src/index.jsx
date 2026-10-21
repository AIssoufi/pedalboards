// Dependencies
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

// Style
import './index.scss';

// Components
import App from './components/App';

// Redux - store
import store from './redux/store';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
