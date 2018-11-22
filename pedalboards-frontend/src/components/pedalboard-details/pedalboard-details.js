import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import "./pedalboard-details.scss";

const PedalboardDetails = props => (
  <div className="pedalboard">
    <header>
      <div className="author">
        <span className="author-name"> {props.author.name}</span>
        <a href={props.uri} target="_blank" rel="noopener noreferrer">{props.uri}</a>
      </div>
      {props.pedalboardCount ?
        <div className="count-container">
          <a className="count" href="#null">
            <span>{props.pedalboardCount}</span>
          </a>
          <span className="pedalboard-count-text">Pedalboards using it</span>
        </div> :
        null}
    </header>
    <h2>{props.label}</h2>
    <div className="plugin-media-container">
      <img className="plugin-media" src={props.screenshotUrl} alt="Plugin screenshot" />
    </div>
    <div className="category-container">{
      props.categories.map((categorie, index) => <Link
        to={{
          pathname: '/plugins',
          search: `?categories=${categorie}`
        }}
        key={index}
        className="plugin-category">{categorie}</Link>)
    }
    </div>
    <p className="pedalboard-description" dangerouslySetInnerHTML={{ __html: props.description }} />

    <div className="plugin-control-ports">
      <table>
        <thead>
          <tr>
            <th>Control</th>
            <th>Default</th>
            <th>Min</th>
            <th>Max</th>
          </tr>
        </thead>
        <tbody>
          {
            props.controlPorts.map((controlPort, index) => (
              <tr key={index}>
                <td>{controlPort.name}</td>
                <td>{controlPort.default}</td>
                <td>{controlPort.min}</td>
                <td>{controlPort.max}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>

    <div className="plugin-misc-info-container">
      <span className="plugin-uri">{props.uri}</span>
      <span className="plugin-version">v{props.version}</span>
    </div>
  </div>
);

PedalboardDetails.propTypes = {
  author: PropTypes.shape({
    name: PropTypes.string
  }),
  categories: PropTypes.arrayOf(PropTypes.string),
  controlPorts: PropTypes.arrayOf(PropTypes.shape({
    default: PropTypes.number,
    max: PropTypes.number,
    min: PropTypes.number,
    name: PropTypes.string
  })),
  description: PropTypes.string,
  label: PropTypes.string,
  pedalboardCount: PropTypes.number,
  screenshotUrl: PropTypes.string,
  uri: PropTypes.string
}

export default PedalboardDetails;
