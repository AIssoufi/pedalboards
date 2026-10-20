/* eslint-disable global-require */
// Constants
import { ADMIN_PANEL_PATH } from './constants';

const CMS_URL = 'http://localhost:3002';
const ADMIN_PANEL_LABEL = 'Admin Panel';
const INITIAL_ENV = process.env;

/**
 * Renders the header in a router, with the given CMS address. The header reads the address when
 * its module loads, so the modules load again, React and the router with them, so that they share
 * one copy.
 *
 * @param {string} cmsUrl - Value of `REACT_APP_BACKEND`.
 * @returns {HTMLDivElement} The element that holds the header.
 */
const renderHeader = (cmsUrl) => {
  process.env.REACT_APP_BACKEND = cmsUrl;
  jest.resetModules();
  const React = require('react');
  const ReactDOM = require('react-dom');
  const { MemoryRouter } = require('react-router-dom');
  const Header = require('./index').default;

  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><Header /></MemoryRouter>, div);
  return div;
};

beforeEach(() => {
  process.env = { ...INITIAL_ENV };
});

afterEach(() => {
  process.env = INITIAL_ENV;
});

it('links to the admin panel of the CMS when the CMS has an address', () => {
  const header = renderHeader(CMS_URL);
  const adminPanelLink = header.querySelector(`a[href="${CMS_URL}${ADMIN_PANEL_PATH}"]`);

  expect(adminPanelLink).not.toBeNull();
  expect(adminPanelLink.textContent).toBe(ADMIN_PANEL_LABEL);
});

it('leaves the admin panel link out when the CMS has no address', () => {
  const header = renderHeader('');

  expect(header.textContent).toContain('Plugins');
  expect(header.textContent).not.toContain(ADMIN_PANEL_LABEL);
});
