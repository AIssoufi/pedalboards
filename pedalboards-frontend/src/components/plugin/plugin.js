import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './plugin.scss';

const Plugin = props => (
  <div className="plugin">
    <Link to={`/plugin/${props._id}`}>
      <img
        src={props.screenshotUrl}
        alt="Plugin screenshot"
      />
    </Link>
    <div className="category-container">
      {props.categories.map(category => <Link
        key={category}
        to={{
          pathname: '/plugins',
          search: `?categories=${category}`
        }}
        className="category">{category}</Link>)}
    </div>
    <hr />
    <div className="info-container">
      <Link
        to={{
          pathname: '/plugins',
          search: `?label=${props.label}`
        }}
        className="info">{props.label}</Link>
      <Link
        to={{
          pathname: '/plugins',
          search: `?brand=${props.brand}`
        }}
        className="info brand">{props.brand}</Link>
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
  "controlPorts": PropTypes.arrayOf(PropTypes.shape({
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