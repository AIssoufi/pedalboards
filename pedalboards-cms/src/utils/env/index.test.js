// Utils
import { get } from '.';

// Constants
const VARIABLE = 'REACT_APP_ENV_HELPER_TEST';

afterEach(() => {
  delete process.env[VARIABLE];
});

describe('get', () => {
  it('reads the REACT_APP_ variable of a name in any case', () => {
    process.env[VARIABLE] = 'http://localhost:8080';

    expect(get('env_helper_test')).toBe('http://localhost:8080');
    expect(get('ENV_HELPER_TEST')).toBe('http://localhost:8080');
  });

  it('removes the line breaks of the value', () => {
    process.env[VARIABLE] = 'http://localhost:\r\n3002\n';

    expect(get('env_helper_test')).toBe('http://localhost:3002');
  });

  it('returns an empty value as it is', () => {
    process.env[VARIABLE] = '';

    expect(get('env_helper_test')).toBe('');
  });

  it('returns undefined for a variable that is not set', () => {
    expect(get('env_helper_test')).toBeUndefined();
  });

  it('returns undefined for an empty name', () => {
    expect(get('')).toBeUndefined();
  });

  it.each([undefined, null, 42, {}])('throws for the name %p', (envVarName) => {
    expect(() => get(envVarName)).toThrow(TypeError);
  });
});
