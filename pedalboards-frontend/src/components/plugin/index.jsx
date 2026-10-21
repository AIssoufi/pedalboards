// Dependencies
import PropTypes from 'prop-types';
import { Link } from 'react-router';

// Utils
import { buildPluginFilterLink, isPluginFilterValue } from '../../utils/plugin-filter';

// Components
import Tooltip from '../tooltip';
import FilterTooltipContent from './filter-tooltip-content';

// Style
import './style.scss';

/**
 * Card of a plugin in the grid: its screenshot, linking to its details, then links that filter
 * the plugins by each of its categories, by its label and by its brand. A missing field shows
 * nothing in its place.
 */
const Plugin = ({
  _id = '', name = '', screenshotUrl = '', categories = [], brand = '', label = ''
}) => {
  const categoryList = Array.isArray(categories) ? categories.filter(isPluginFilterValue) : [];
  const screenshot = screenshotUrl && <img src={screenshotUrl} alt="Plugin screenshot" />;

  return (
    <div className="plugin">
      {_id ? (
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
          <Link to={`/plugin/${_id}`}>
            {screenshot}
          </Link>
        </Tooltip>
      ) : screenshot}
      <div className="category-container">
        {categoryList.map(category => (
          <Tooltip
            key={category}
            content={(
              <FilterTooltipContent heading="Categorie" value={category} kind="categories" />
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

Plugin.propTypes = {
  /** Identifier of the plugin, ending the link to its details. No link when empty. @default '' */
  _id: PropTypes.string,
  /** Author of the plugin, not shown on the card. */
  author: PropTypes.shape({
    avatarUrl: PropTypes.string,
    name: PropTypes.string
  }),
  /** Brand, linking to the plugins of that brand. Hidden when empty. @default '' */
  brand: PropTypes.string,
  /** Categories, each linking to the plugins of that category. @default [] */
  categories: PropTypes.arrayOf(PropTypes.string),
  /** Label, linking to the plugins of that label. Hidden when empty. @default '' */
  label: PropTypes.string,
  /** Name, shown in the tooltip of the screenshot. @default '' */
  name: PropTypes.string,
  /** URL of the screenshot. The image is omitted when empty. @default '' */
  screenshotUrl: PropTypes.string
};

export default Plugin;
