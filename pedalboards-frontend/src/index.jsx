// Dependencies
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';

// Style
import '@fortawesome/fontawesome-svg-core/styles.css';
import './index.scss';

// Components
import App from './components/App';

// Redux - store
import setupStore from './redux/store';

// Utils
import { reloadOnceForStaleChunk } from './utils/stale-chunk-reload';

// The CSS of the icons comes from the stylesheet imported above, so Font Awesome adds no <style>
// element, which the Content Security Policy of public/_headers would refuse
fontAwesomeConfig.autoAddCss = false;

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
