// Dependencies
import { render, screen } from '@testing-library/react';
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
 */
const renderHeader = async (cmsUrl) => {
  vi.stubEnv('VITE_BACKEND', cmsUrl);
  vi.resetModules();
  const { default: Header } = await import('./index');

  render(<MemoryRouter><Header /></MemoryRouter>);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

it('links to the admin panel of the CMS when the CMS has an address', async () => {
  await renderHeader(CMS_URL);

  const adminPanelLink = screen.getByRole('link', { name: ADMIN_PANEL_LABEL });
  expect(adminPanelLink.getAttribute('href')).toBe(`${CMS_URL}${ADMIN_PANEL_PATH}`);
});

it('leaves the admin panel link out when the CMS has no address', async () => {
  await renderHeader('');

  expect(screen.getByRole('link', { name: 'Plugins' })).toBeDefined();
  expect(screen.queryByText(ADMIN_PANEL_LABEL)).toBeNull();
});
