// Dependencies
import { readFileSync } from 'node:fs';

// Constants
import {
  BRAND_COLOR,
  BRAND_RGB,
  ICON_SIZES,
  PEDAL_ICON_SHAPES,
  RGB_CHANNELS,
  WHITE_RGB
} from './constants.mjs';

// Utils
import { drawPedalIcon, isInsideShape, toIconFileName } from './icons.mjs';
import { decodePng } from './png-test-utils.mjs';

const GENERATE_HINT = 'an icon of public/ differs from icons.mjs: run `pnpm generate:icons`';

const MANIFEST_PATH = '../public/manifest.json';
const COLORS_PATH = '../src/styles/_colors.scss';
const PUBLIC_PATH = '../public/';

// Launchers that crop icons to their own shape keep the circle of this radius, in icon sides
const SAFE_ZONE_RADIUS = 0.4;

// The path stays a variable: Vite rewrites `new URL` around a literal path into the URL of an asset
const readProjectFile = ({ relativePath, encoding }) => (
  readFileSync(new URL(relativePath, import.meta.url), encoding)
);

const readPixel = ({ image, x, y }) => {
  const pixelIndex = Math.floor(y * image.height) * image.width + Math.floor(x * image.width);
  const offset = pixelIndex * RGB_CHANNELS;

  return [...image.pixels.slice(offset, offset + RGB_CHANNELS)];
};

const toHexColor = rgb => `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`;

describe('isInsideShape', () => {
  const shape = {
    centerX: 0.5,
    centerY: 0.5,
    halfWidth: 0.2,
    halfHeight: 0.3,
    radius: 0.1,
    color: WHITE_RGB
  };

  it.each([
    ['its center', 0.5, 0.5],
    ['the middle of an edge', 0.3, 0.5],
    ['the start of a rounded corner', 0.4, 0.2]
  ])('counts %s inside', (_case, x, y) => {
    expect(isInsideShape({ x, y, shape })).toBe(true);
  });

  it.each([
    ['the cut corner', 0.31, 0.21],
    ['a point past an edge', 0.29, 0.5],
    ['a point below', 0.5, 0.81]
  ])('counts %s outside', (_case, x, y) => {
    expect(isInsideShape({ x, y, shape })).toBe(false);
  });

  it('draws a circle when the half sizes equal the radius', () => {
    const circle = { ...shape, halfWidth: 0.1, halfHeight: 0.1, radius: 0.1 };

    expect(isInsideShape({ x: 0.57, y: 0.57, shape: circle })).toBe(true);
    expect(isInsideShape({ x: 0.58, y: 0.58, shape: circle })).toBe(false);
  });
});

describe('drawPedalIcon', () => {
  const image = drawPedalIcon(ICON_SIZES[0]);

  it('fills a square of the size', () => {
    expect(image.width).toBe(ICON_SIZES[0]);
    expect(image.height).toBe(ICON_SIZES[0]);
    expect(image.pixels).toHaveLength(ICON_SIZES[0] ** 2 * RGB_CHANNELS);
  });

  it.each([
    ['the corners', [[0, 0], [0.99, 0], [0, 0.99], [0.99, 0.99]], BRAND_RGB],
    ['the body of the pedal', [[0.5, 0.45], [0.32, 0.8]], WHITE_RGB],
    ['the knobs', [[0.4, 0.33], [0.6, 0.33]], BRAND_RGB],
    ['the pointers of the knobs', [[0.4, 0.28], [0.6, 0.28]], WHITE_RGB],
    ['the ring of the footswitch', [[0.5, 0.59]], BRAND_RGB],
    ['the center of the footswitch', [[0.5, 0.66]], WHITE_RGB]
  ])('paints %s', (_case, points, color) => {
    points.forEach(([x, y]) => {
      expect(readPixel({ image, x, y })).toEqual(color);
    });
  });

  it('blends the pixels that an edge crosses', () => {
    // The left edge of the body, at 30% of 192 pixels, crosses the 58th column
    const [red] = readPixel({ image, x: 0.3, y: 0.5 });

    expect(red).toBeGreaterThan(BRAND_RGB[0]);
    expect(red).toBeLessThan(WHITE_RGB[0]);
  });

  it('draws a one-pixel icon', () => {
    expect(drawPedalIcon(1).pixels).toHaveLength(RGB_CHANNELS);
  });

  it.each([0, -192, 1.5, Number.NaN, '192', undefined, null])('refuses a size of %s', size => {
    expect(() => drawPedalIcon(size)).toThrow(RangeError);
  });

  it('keeps every shape inside the zone that launchers never crop', () => {
    PEDAL_ICON_SHAPES.forEach(shape => {
      // The farthest point of a rounded rectangle lies on the arc of a corner
      const cornerX = Math.abs(shape.centerX - 0.5) + shape.halfWidth - shape.radius;
      const cornerY = Math.abs(shape.centerY - 0.5) + shape.halfHeight - shape.radius;

      expect(Math.hypot(cornerX, cornerY) + shape.radius).toBeLessThanOrEqual(SAFE_ZONE_RADIUS);
    });
  });
});

describe('toIconFileName', () => {
  it.each(ICON_SIZES)('names the %i px icon after its size', size => {
    expect(toIconFileName(size)).toBe(`icon-${size}.png`);
  });
});

describe('the install icons of the site', () => {
  const manifest = JSON.parse(readProjectFile({ relativePath: MANIFEST_PATH, encoding: 'utf8' }));

  it.each(ICON_SIZES)('holds the %i px icon that icons.mjs draws', size => {
    const decoded = decodePng(readProjectFile({
      relativePath: `${PUBLIC_PATH}${toIconFileName(size)}`
    }));
    const drawn = drawPedalIcon(size);

    expect(decoded.width, GENERATE_HINT).toBe(size);
    expect(decoded.height, GENERATE_HINT).toBe(size);
    // A byte comparison: toEqual on the 786,432 values of the 512 px icon takes over a second
    expect(decoded.pixels.equals(drawn.pixels), GENERATE_HINT).toBe(true);
  });

  it.each(ICON_SIZES)('lists the %i px icon in the manifest', size => {
    expect(manifest.icons).toContainEqual({
      src: toIconFileName(size),
      sizes: `${size}x${size}`,
      type: 'image/png'
    });
  });

  it('gives the manifest the brand color of the styles', () => {
    expect(manifest.theme_color).toBe(BRAND_COLOR);
    expect(toHexColor(BRAND_RGB)).toBe(BRAND_COLOR);
    const colors = readProjectFile({ relativePath: COLORS_PATH, encoding: 'utf8' });

    expect(colors).toContain(`$bg-primary-color: ${BRAND_COLOR};`);
  });
});
