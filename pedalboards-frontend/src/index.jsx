// Dependencies
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

// Style
import './index.scss';

// Components
import App from './components/App';

// Redux - store
import setupStore from './redux/store';

// Utils
import { reloadOnceForStaleChunk } from './utils/stale-chunk-reload';

const store = setupStore();

// Vite fires this event when a lazy chunk fails to load, as in a tab opened before a deploy
window.addEventListener('vite:preloadError', () => {
  reloadOnceForStaleChunk({
    getStorage: () => window.sessionStorage,
    reload: () => window.location.reload()
  });
});

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
