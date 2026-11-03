// Constants
import { EMPTY_STATE_TEXT } from '../../constants/search';

// Utils
import { buildResultsStatus } from './utils';

const LOADING_TEXT = 'Loading plugins...';

describe('buildResultsStatus', () => {
  it.each([
    [1, '1 plugin found'],
    [2, '2 plugins found'],
    [10, '10 plugins found'],
    [125, '125 plugins found']
  ])('reads %i as %j', (pluginCount, expected) => {
    expect(buildResultsStatus({ pluginCount })).toBe(expected);
  });

  it('reads the empty state for no plugin', () => {
    expect(buildResultsStatus({ pluginCount: 0 })).toBe(EMPTY_STATE_TEXT);
  });

  it.each([
    ['no params', undefined],
    ['empty params', {}],
    ['a missing count', { isLoading: false, hasFailed: false }]
  ])('reads the empty state for %s', (description, params) => {
    expect(buildResultsStatus(params)).toBe(EMPTY_STATE_TEXT);
  });

  it.each([
    ['while a new list loads', { pluginCount: 3, isLoading: true }],
    ['while the first list loads', { pluginCount: 0, isLoading: true }],
    ['with a missing count', { isLoading: true }],
    ['for a truthy isLoading that is not a boolean', { pluginCount: 3, isLoading: 'yes' }]
  ])('reads the waiting %s', (description, params) => {
    expect(buildResultsStatus(params)).toBe(LOADING_TEXT);
  });

  it.each([
    ['after a failure', { pluginCount: 3, hasFailed: true }],
    ['after a failure with no plugin', { pluginCount: 0, hasFailed: true }],
    ['when a failure and a load are both reported', { pluginCount: 3, isLoading: true, hasFailed: true }]
  ])('reads nothing %s', (description, params) => {
    expect(buildResultsStatus(params)).toBe('');
  });
});
