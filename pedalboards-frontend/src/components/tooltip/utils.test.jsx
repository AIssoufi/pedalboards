// Dependencies
import React from 'react';

// Constants
import { DEFAULT_TOOLTIP_PLACEMENT, TOOLTIP_DISTANCE_PX, VIEWPORT_MARGIN_PX } from './constants';

// Utils
import { getBubblePosition, getTooltipPlacement, isEmptyNode } from './utils';

const BUBBLE_SIZE = { width: 150, height: 30 };
const DESKTOP_VIEWPORT = { width: 1280, height: 900 };
const PHONE_VIEWPORT = { width: 390, height: 844 };

/**
 * Builds the box of a trigger, as `getBoundingClientRect` gives it.
 *
 * @param {object} params
 * @param {number} params.top - Top side, in viewport coordinates.
 * @param {number} params.left - Left side, in viewport coordinates.
 * @param {number} [params.width] - Width, in pixels.
 * @param {number} [params.height] - Height, in pixels.
 * @returns {{top: number, bottom: number, left: number, width: number}} The box.
 */
const buildRect = ({
  top, left, width = 50, height = 20
}) => ({
  top, bottom: top + height, left, width
});

describe('getTooltipPlacement', () => {
  it.each([
    ['top', 'top'],
    ['bottom', 'bottom'],
    ['left', DEFAULT_TOOLTIP_PLACEMENT],
    ['TOP', DEFAULT_TOOLTIP_PLACEMENT],
    ['', DEFAULT_TOOLTIP_PLACEMENT],
    [undefined, DEFAULT_TOOLTIP_PLACEMENT],
    [null, DEFAULT_TOOLTIP_PLACEMENT],
    [42, DEFAULT_TOOLTIP_PLACEMENT]
  ])('gives %j for the placement %j', (placement, expected) => {
    expect(getTooltipPlacement(placement)).toBe(expected);
  });
});

describe('isEmptyNode', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['true', true],
    ['false', false],
    ['an empty string', ''],
    ['an empty list', []]
  ])('is true for %s', (description, node) => {
    expect(isEmptyNode(node)).toBe(true);
  });

  it.each([
    ['zero, which React shows', 0],
    ['a blank string, which React shows', ' '],
    ['a text', 'Help'],
    ['an element', <i>Help</i>],
    ['a list of nodes', ['Help', <br key="break" />]]
  ])('is false for %s', (description, node) => {
    expect(isEmptyNode(node)).toBe(false);
  });
});

describe('getBubblePosition', () => {
  it('centers the bubble above its trigger', () => {
    const position = getBubblePosition({
      triggerRect: buildRect({ top: 200, left: 100 }),
      bubbleSize: BUBBLE_SIZE,
      placement: 'top',
      viewportSize: DESKTOP_VIEWPORT
    });

    expect(position).toEqual({ top: 200 - TOOLTIP_DISTANCE_PX - 30, left: 50, placement: 'top' });
  });

  it('centers the bubble below its trigger', () => {
    const position = getBubblePosition({
      triggerRect: buildRect({ top: 200, left: 100 }),
      bubbleSize: BUBBLE_SIZE,
      placement: 'bottom',
      viewportSize: DESKTOP_VIEWPORT
    });

    expect(position).toEqual({ top: 220 + TOOLTIP_DISTANCE_PX, left: 50, placement: 'bottom' });
  });

  it.each([undefined, 'left', null])('shows the bubble above for the placement %j', (placement) => {
    const position = getBubblePosition({
      triggerRect: buildRect({ top: 200, left: 100 }),
      bubbleSize: BUBBLE_SIZE,
      placement,
      viewportSize: DESKTOP_VIEWPORT
    });

    expect(position.placement).toBe('top');
  });

  describe('side', () => {
    // Height the bubble needs on a side of its trigger
    const NEEDED_HEIGHT = BUBBLE_SIZE.height + TOOLTIP_DISTANCE_PX;
    // Top of a trigger, 20 pixels high, that leaves the bubble just enough room below it
    const LOWEST_TOP = DESKTOP_VIEWPORT.height - 20 - NEEDED_HEIGHT;

    it.each([
      ['keeps the top when the bubble just fits above', 'top', NEEDED_HEIGHT, 'top'],
      ['moves below when the bubble lacks a pixel above', 'top', NEEDED_HEIGHT - 1, 'bottom'],
      ['keeps the bottom when the bubble just fits below', 'bottom', LOWEST_TOP, 'bottom'],
      ['moves above when the bubble lacks a pixel below', 'bottom', LOWEST_TOP + 1, 'top']
    ])('%s', (description, placement, triggerTop, expected) => {
      const position = getBubblePosition({
        triggerRect: buildRect({ top: triggerTop, left: 100 }),
        bubbleSize: BUBBLE_SIZE,
        placement,
        viewportSize: DESKTOP_VIEWPORT
      });

      expect(position.placement).toBe(expected);
    });

    it('keeps the side asked for when neither side has room', () => {
      const position = getBubblePosition({
        triggerRect: buildRect({ top: 20, left: 100 }),
        bubbleSize: BUBBLE_SIZE,
        placement: 'top',
        viewportSize: { width: 1280, height: 60 }
      });

      expect(position).toEqual({ top: 20 - NEEDED_HEIGHT, left: 50, placement: 'top' });
    });
  });

  describe('sideways shift', () => {
    it('shifts the bubble right to keep it off the left side of the viewport', () => {
      const position = getBubblePosition({
        triggerRect: buildRect({ top: 200, left: 0, width: 20 }),
        bubbleSize: BUBBLE_SIZE,
        placement: 'top',
        viewportSize: PHONE_VIEWPORT
      });

      expect(position.left).toBe(VIEWPORT_MARGIN_PX);
    });

    it('shifts the bubble left to keep it off the right side of the viewport', () => {
      const position = getBubblePosition({
        triggerRect: buildRect({ top: 200, left: 370, width: 20 }),
        bubbleSize: BUBBLE_SIZE,
        placement: 'top',
        viewportSize: PHONE_VIEWPORT
      });

      expect(position.left).toBe(390 - VIEWPORT_MARGIN_PX - 150);
    });

    it('keeps a centered bubble that just fits on the right', () => {
      // Centered, the bubble spans from 305 to 455, 10 pixels from the right side
      const position = getBubblePosition({
        triggerRect: buildRect({ top: 200, left: 355, width: 50 }),
        bubbleSize: BUBBLE_SIZE,
        placement: 'top',
        viewportSize: { width: 465, height: 844 }
      });

      expect(position.left).toBe(305);
    });

    it('starts a bubble wider than the viewport at its left margin', () => {
      const position = getBubblePosition({
        triggerRect: buildRect({ top: 200, left: 170, width: 50 }),
        bubbleSize: { width: 400, height: 30 },
        placement: 'top',
        viewportSize: PHONE_VIEWPORT
      });

      expect(position.left).toBe(VIEWPORT_MARGIN_PX);
    });
  });

  it('places the bubble of a trigger without size in the viewport', () => {
    const position = getBubblePosition({
      triggerRect: buildRect({
        top: 0, left: 0, width: 0, height: 0
      }),
      bubbleSize: BUBBLE_SIZE,
      placement: 'top',
      viewportSize: PHONE_VIEWPORT
    });

    expect(position).toEqual({
      top: TOOLTIP_DISTANCE_PX, left: VIEWPORT_MARGIN_PX, placement: 'bottom'
    });
  });
});
