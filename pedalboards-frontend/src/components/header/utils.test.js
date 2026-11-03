import { getAdminPanelUrl } from './utils';

describe('getAdminPanelUrl', () => {
  it('links to the plugin list of the CMS', () => {
    expect(getAdminPanelUrl('http://localhost:3002')).toBe('http://localhost:3002/plugins');
  });

  it.each([['an empty', ''], ['a missing', undefined], ['a null', null]])('gives no link for %s address', (label, cmsUrl) => {
    expect(getAdminPanelUrl(cmsUrl)).toBeNull();
  });
});
