// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

// Constants
import { ADMIN_PANEL_PATH } from './constants';

const CMS_URL = 'http://localhost:3002';
const ADMIN_PANEL_LABEL = 'Admin Panel';

/**
 * Renders the header in a router, with the given CMS address. The header reads the address when
 * its module loads, so its module loads again after the address changes.
 *
 * @param {string} cmsUrl - Value of `VITE_BACKEND`.
 * @returns {Promise<HTMLDivElement>} The element that holds the header.
 */
const renderHeader = async (cmsUrl) => {
  vi.stubEnv('VITE_BACKEND', cmsUrl);
  vi.resetModules();
  const { default: Header } = await import('./index');

  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><Header /></MemoryRouter>, div);
  return div;
};

afterEach(() => {
  vi.unstubAllEnvs();
});

it('links to the admin panel of the CMS when the CMS has an address', async () => {
  const header = await renderHeader(CMS_URL);
  const adminPanelLink = header.querySelector(`a[href="${CMS_URL}${ADMIN_PANEL_PATH}"]`);

  expect(adminPanelLink).not.toBeNull();
  expect(adminPanelLink.textContent).toBe(ADMIN_PANEL_LABEL);
});

it('leaves the admin panel link out when the CMS has no address', async () => {
  const header = await renderHeader('');

  expect(header.textContent).toContain('Plugins');
  expect(header.textContent).not.toContain(ADMIN_PANEL_LABEL);
});
