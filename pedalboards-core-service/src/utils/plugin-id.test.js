import { describe, expect, it } from 'vitest';

import { toPluginId } from './plugin-id.js';

describe('toPluginId', () => {
	it('joins the lower case words with dashes', () => {
		expect(toPluginId('MDA Overdrive')).toBe('mda-overdrive');
		expect(toPluginId('Invada Stereo Phaser (sum L+R in)')).toBe('invada-stereo-phaser-sum-l-r-in');
	});

	it('drops the accents and the dashes at both ends', () => {
		expect(toPluginId(' Écho à lampes! ')).toBe('echo-a-lampes');
	});

	it.each(['', '   ', '!?*', '日本'])('gives an empty id for %j, which has no ASCII letter nor digit', name => {
		expect(toPluginId(name)).toBe('');
	});
});
