import React from 'react';
import PropTypes from 'prop-types';

const Plugin = props => (
  <div className="plugin-container">
    <div className="plugin">
      <a href="#toto">
        <img
          src={props.screenshotUrl}
          alt="Plugin screenshot"
        />
      </a>
      <div className="category-container">
        {props.categories.map(category => <a href="#toto" className="category">{category}</a>)}
      </div>
      <hr />
      <div className="info-container">
        <a href="#toto" className="info">{props.label}</a>
        <a href="#toto" className="info brand">{props.brand}</a>
      </div>
    </div>
  </div>
);

Plugin.propTypes = {
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