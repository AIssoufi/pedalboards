// Helpers
import { RequestError } from '../../helpers/request.helper';

// Utils
import { isPluginNotFound } from './utils';

describe('isPluginNotFound', () => {
  it('is true for a request error with the 404 status', () => {
    expect(isPluginNotFound(new RequestError({ message: 'not found', status: 404 }))).toBe(true);
  });

  it('is true for any error that carries the 404 status', () => {
    expect(isPluginNotFound({ status: 404 })).toBe(true);
  });

  it.each([
    ['an error of the server', new RequestError({ message: 'server', status: 500 })],
    ['the status just below', new RequestError({ message: 'forbidden', status: 403 })],
    ['the status just above', new RequestError({ message: 'not allowed', status: 405 })],
    ['a network error, without a status', new RequestError({ message: 'offline' })],
    ['a chunk that fails to load', new TypeError('Failed to fetch dynamically imported module')],
    ['a status written as a string', { status: '404' }],
    ['a status that is not a number', { status: Number.NaN }],
    ['a null status', { status: null }]
  ])('is false for %s', (description, error) => {
    expect(isPluginNotFound(error)).toBe(false);
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['a string', '404'],
    ['a number', 404]
  ])('is false, without throwing, for %s', (description, error) => {
    expect(isPluginNotFound(error)).toBe(false);
  });
});
