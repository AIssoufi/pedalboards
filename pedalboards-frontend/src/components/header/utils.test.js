import { ADMIN_PANEL_PATH } from './constants';
import { getAdminPanelUrl } from './utils';

describe('getAdminPanelUrl', () => {
  it('links to the login page of the CMS', () => {
    expect(getAdminPanelUrl('http://localhost:3002')).toBe(`http://localhost:3002${ADMIN_PANEL_PATH}`);
  });

  it.each([['an empty', ''], ['a missing', undefined], ['a null', null]])('gives no link for %s address', (label, cmsUrl) => {
    expect(getAdminPanelUrl(cmsUrl)).toBeNull();
  });
});
