// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tippy';

// Utils
import { buildPluginFilterLink, isPluginFilterValue } from '../../utils/plugin-filter';

// Components
import FilterTooltipContent from './filter-tooltip-content';

// Style
import './style.scss';
import 'react-tippy/dist/tippy.css';

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
        <Link to={`/plugin/${_id}`}>
          <Tooltip
            html={(
              <i>
                Click to discover
                <br />
                {`more details about ${name || 'this plugin'}.`}
              </i>
            )}
            position="bottom"
          >
            {screenshot}
          </Tooltip>
        </Link>
      ) : screenshot}
      <div className="category-container">
        {categoryList.map(category => (
          <Tooltip
            key={category}
            html={<FilterTooltipContent heading="Categorie" value={category} kind="categories" />}
            position="top"
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
            html={<FilterTooltipContent heading="Label" value={label} kind="labels" />}
            position="top"
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
            html={<FilterTooltipContent heading="Brand" value={brand} kind="brands" />}
            position="bottom"
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
