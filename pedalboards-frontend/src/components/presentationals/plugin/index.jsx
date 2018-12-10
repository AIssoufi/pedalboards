// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tippy';

// CSS
import './style.scss';
import 'react-tippy/dist/tippy.css';

const Plugin = props => (
  <div className="plugin">
    <Link to={`/plugin/${props._id}`}>
      <Tooltip
        title={`<i>Click to discover<br>more details about ${props.name}.</i>`}
        position="bottom">
        <img
          src={props.screenshotUrl}
          alt="Plugin screenshot"
        />
      </Tooltip>
    </Link>
    <div className="category-container">
      {props.categories.map(category => <Tooltip
        key={category}
        title={`<b>Categorie</b><br><i>Click to filter plugin<br>by <b>${category}</b> categories.</i>`}
        position="top"><Link

          to={{
            pathname: '/plugins',
            search: `?categories=${category}`
          }}
          className="category">{category}</Link></Tooltip>)}
    </div>
    <hr />
    <div className="info-container">
      <Tooltip
        title={`<b>Label</b><br><i>Click to filter plugin<br>by ${props.label} labels.</i>`}
        position="top">
        <Link
          to={{
            pathname: '/plugins',
            search: `?label=${props.label}`
          }}
          className="info">{props.label}</Link>
      </Tooltip>
      <Tooltip
        title={`<b>Brand</b><br><i>Click to filter plugin<br>by ${props.brand} brands.</i>`}
        position="bottom">
        <Link
          to={{
            pathname: '/plugins',
            search: `?brand=${props.brand}`
          }}
          className="info brand">{props.brand}</Link>
      </Tooltip>
    </div>
  </div>
);

Plugin.propTypes = {
  _id: PropTypes.string.isRequired,
  author: PropTypes.shape({
    avatarUrl: PropTypes.string,
    name: PropTypes.string
  }),
  brand: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string),
  controlPorts: PropTypes.arrayOf(PropTypes.shape({
    default: PropTypes.number,
    max: PropTypes.number,
    min: PropTypes.number,
    name: PropTypes.string
  })),
  description: PropTypes.string,
  imageHeight: PropTypes.number,
  imageWidth: PropTypes.number,
  label: PropTypes.string,
  name: PropTypes.string,
  pedalboardCount: PropTypes.number,
  screenshotUrl: PropTypes.string,
  stable: PropTypes.bool,
  thumbnailUrl: PropTypes.string,
  uri: PropTypes.string
}

export default Plugin;