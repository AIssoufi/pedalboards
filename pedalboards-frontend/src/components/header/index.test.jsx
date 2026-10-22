// Dependencies
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

// Constants
import { ADMIN_PANEL_PATH } from './constants';

const CMS_URL = 'http://localhost:3002';
const ADMIN_PANEL_LABEL = 'Admin Panel';

/**
 * Renders the header in a router, with the given CMS address. The header reads the address when
 * its module loads, so its module loads again after the address changes.
 *
 * @param {Object} params
 * @param {string} params.cmsUrl - Value of `VITE_BACKEND`.
 * @param {string} [params.url] - URL the router starts at. @default '/'
 */
const renderHeader = async ({ cmsUrl, url = '/' }) => {
  vi.stubEnv('VITE_BACKEND', cmsUrl);
  vi.resetModules();
  const { default: Header } = await import('./index');

  render(<MemoryRouter initialEntries={[url]}><Header /></MemoryRouter>);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

it('links to the admin panel of the CMS when the CMS has an address', async () => {
  await renderHeader({ cmsUrl: CMS_URL });

  const adminPanelLink = screen.getByRole('link', { name: ADMIN_PANEL_LABEL });
  expect(adminPanelLink.getAttribute('href')).toBe(`${CMS_URL}${ADMIN_PANEL_PATH}`);
});

it('leaves the admin panel link out when the CMS has no address', async () => {
  await renderHeader({ cmsUrl: '' });

  expect(screen.getByRole('link', { name: 'Plugins' })).toBeDefined();
  expect(screen.queryByText(ADMIN_PANEL_LABEL)).toBeNull();
});

it.each([
  ['marks', '/plugins?brand=MDA', true],
  ['leaves unmarked', '/plugin/2', false]
])('%s the Plugins link as active at %s', async (description, url, isActive) => {
  await renderHeader({ cmsUrl: '', url });

  const pluginsLink = screen.getByRole('link', { name: 'Plugins' });
  expect(pluginsLink.classList.contains('active')).toBe(isActive);
});

it('names the menu icon after the page it leads to', async () => {
  await renderHeader({ cmsUrl: '' });

  expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/');
});
