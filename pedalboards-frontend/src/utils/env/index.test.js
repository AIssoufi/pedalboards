import { get } from './index';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('get', () => {
  it('reads the VITE_ variable of a name in any case', () => {
    vi.stubEnv('VITE_CORE_SERVICE', 'http://localhost:8080');

    expect(get('core_service')).toBe('http://localhost:8080');
    expect(get('CORE_SERVICE')).toBe('http://localhost:8080');
  });

  it('removes the line breaks of the value', () => {
    vi.stubEnv('VITE_BACKEND', 'http://localhost:3002\r\n');

    expect(get('backend')).toBe('http://localhost:3002');
  });

  it('returns an empty value as it is', () => {
    vi.stubEnv('VITE_BACKEND', '');

    expect(get('backend')).toBe('');
  });

  it('returns undefined for a variable that is not set', () => {
    expect(get('not_set')).toBeUndefined();
  });

  it('returns undefined for an empty name', () => {
    expect(get('')).toBeUndefined();
  });

  it.each([undefined, null, 42, {}])('throws for the name %p', (envVarName) => {
    expect(() => get(envVarName)).toThrow(TypeError);
  });
});
