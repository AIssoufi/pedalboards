// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tippy';

// Utils
import { buildPluginFilterLink } from 'utils/plugin-filter';

// Style
import './style.scss';
import 'react-tippy/dist/tippy.css';

const Plugin = ({
  _id, name, screenshotUrl, categories, brand, label
}) => (
  <div className="plugin">
    <Link to={`/plugin/${_id}`}>
      <Tooltip
        html={(
          <i>
            Click to discover
            <br />
            {`more details about ${name}.`}
          </i>
        )}
        position="bottom"
      >
        <img
          src={screenshotUrl}
          alt="Plugin screenshot"
        />
      </Tooltip>
    </Link>
    <div className="category-container">
      {categories.map(category => (
        <Tooltip
          key={category}
          html={(
            <>
              <b>Categorie</b>
              <br />
              <i>
                Click to filter plugin
                <br />
                {'by '}
                <b>{category}</b>
                {' categories.'}
              </i>
            </>
          )}
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
      <Tooltip
        html={(
          <>
            <b>Label</b>
            <br />
            <i>
              Click to filter plugin
              <br />
              {`by ${label} labels.`}
            </i>
          </>
        )}
        position="top"
      >
        <Link
          to={buildPluginFilterLink({ field: 'label', value: label })}
          className="info"
        >
          {label}
        </Link>
      </Tooltip>
      <Tooltip
        html={(
          <>
            <b>Brand</b>
            <br />
            <i>
              Click to filter plugin
              <br />
              {`by ${brand} brands.`}
            </i>
          </>
        )}
        position="bottom"
      >
        <Link
          to={buildPluginFilterLink({ field: 'brand', value: brand })}
          className="info brand"
        >
          {brand}
        </Link>
      </Tooltip>
    </div>
  </div>
);

Plugin.propTypes = {
  _id: PropTypes.string.isRequired,
  author: PropTypes.shape({
    avatarUrl: PropTypes.string,
    name: PropTypes.string
  }).isRequired,
  brand: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  screenshotUrl: PropTypes.string.isRequired
};

export default Plugin;
