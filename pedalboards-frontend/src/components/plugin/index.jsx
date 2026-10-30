// Dependencies
import { Link } from 'react-router';

// Utils
import { toImageDimension } from '../../utils/image-dimension';
import { buildPluginFilterLink, isPluginFilterValue } from '../../utils/plugin-filter';
import { buildPluginPathname } from '../../utils/plugin-pathname';
import { toScreenshotAlt } from '../../utils/screenshot-alt';
import { isNonBlankText } from '../../utils/text';

// Components
import Tooltip from '../tooltip';
import FilterTooltipContent from './filter-tooltip-content';

// Style
import './style.scss';

/**
 * Props of {@link Plugin}.
 *
 * @typedef {Object} PluginProps
 * @property {string} [_id=''] - Identifier of the plugin, ending the link to its details. No link
 *   when blank.
 * @property {{ avatarUrl?: string, name?: string }} [author] - Author of the plugin, not shown on
 *   the card.
 * @property {string} [brand=''] - Brand, linking to the plugins of that brand. Hidden when empty.
 * @property {Array<string>} [categories=[]] - Categories, each linking to the plugins of that
 *   category.
 * @property {number} [imageHeight] - Height of the screenshot in pixels, see `imageWidth`.
 * @property {number} [imageWidth] - Width of the screenshot in pixels, declared on the image; the
 *   card shows every screenshot in one box, in `style.scss`. Ignored unless a whole number above 0.
 * @property {boolean} [isScreenshotLazy=false] - Loads the screenshot only once the card nears the
 *   viewport, for the cards below the first row.
 * @property {string} [label=''] - Label, linking to the plugins of that label, and naming the
 *   screenshot for screen readers. Hidden when empty.
 * @property {string} [name=''] - Name, shown in the tooltip of the screenshot.
 * @property {string} [screenshotUrl=''] - URL of the screenshot. The image is omitted when empty.
 */

/**
 * Card of a plugin in the grid: its screenshot, linking to its details, then links that filter
 * the plugins by each of its categories, by its label and by its brand. A missing field shows
 * nothing in its place.
 *
 * @param {PluginProps} props - Props of the component.
 */
const Plugin = ({
  _id = '', name = '', screenshotUrl = '', imageWidth, imageHeight, isScreenshotLazy = false,
  categories = [], brand = '', label = ''
}) => {
  const categoryList = Array.isArray(categories) ? categories.filter(isPluginFilterValue) : [];
  // A blank id names no plugin page, so the screenshot links nowhere
  const hasDetailsLink = isNonBlankText(_id);
  const screenshot = screenshotUrl && (
    <img
      src={screenshotUrl}
      alt={toScreenshotAlt(label)}
      width={toImageDimension(imageWidth)}
      height={toImageDimension(imageHeight)}
      loading={isScreenshotLazy ? 'lazy' : undefined}
    />
  );

  return (
    <div className="plugin">
      {hasDetailsLink ? (
        <Tooltip
          content={(
            <i>
              Click to discover
              <br />
              {`more details about ${name || 'this plugin'}.`}
            </i>
          )}
          placement="bottom"
        >
          <Link to={buildPluginPathname(_id)}>
            {screenshot}
          </Link>
        </Tooltip>
      ) : screenshot}
      <div className="category-container">
        {categoryList.map(category => (
          <Tooltip
            key={category}
            content={(
              <FilterTooltipContent heading="Category" value={category} kind="categories" />
            )}
            placement="top"
          >
            <Link
              to={buildPluginFilterLink({ field: 'categories', value: category })}
              className="category"
            >
              {category}
            </Link>
          </Tooltip>
        ))}
      </div>
      <hr />
      <div className="info-container">
        {label && (
          <Tooltip
            content={<FilterTooltipContent heading="Label" value={label} kind="labels" />}
            placement="top"
          >
            <Link
              to={buildPluginFilterLink({ field: 'label', value: label })}
              className="info"
            >
              {label}
            </Link>
          </Tooltip>
        )}
        {brand && (
          <Tooltip
            content={<FilterTooltipContent heading="Brand" value={brand} kind="brands" />}
            placement="bottom"
          >
            <Link
              to={buildPluginFilterLink({ field: 'brand', value: brand })}
              className="info brand"
            >
              {brand}
            </Link>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default Plugin;
