// Dependencies
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Component
import { Loader } from 'components';

// Style
import './style.scss';

const PedalboardDetails = ({
  author, uri, pedalboardCount, label, screenshotUrl, categories, controlPorts,
  version, description, isLoading
}) => (
  <div className="pedalboard">
    {isLoading
      ? <Loader />
      : (
        <Fragment>
          <header>
            <div className="author">
              <span className="author-name">
                {' '}
                {author.name}
              </span>
              <a href={uri} target="_blank" rel="noopener noreferrer">{uri}</a>
            </div>
            {pedalboardCount
              ? (
                <div className="count-container">
                  <a className="count" href="#null">
                    <span>{pedalboardCount}</span>
                  </a>
                  <span className="pedalboard-count-text">Pedalboards using it</span>
                </div>
              )
              : null}
          </header>
          <h2>{label}</h2>
          <div className="plugin-media-container">
            <img className="plugin-media" src={screenshotUrl} alt="Plugin screenshot" />
          </div>
          <div className="category-container">
            {categories.map((categorie, index) => (
              <Link
                to={{
                  pathname: '/plugins',
                  search: `?categories=${categorie}`
                }}
                key={`${categorie}-${index}`}
                className="plugin-category"
              >
                {categorie}

              </Link>
            ))}
          </div>
          <p
            className="pedalboard-description"
            dangerouslySetInnerHTML={{
              __html: description
            }}
          />
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
                {controlPorts.map((controlPort, index) => (
                  <tr key={index}>
                    <td>{controlPort.name}</td>
                    <td>{controlPort.default}</td>
                    <td>{controlPort.min}</td>
                    <td>{controlPort.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="plugin-misc-info-container">
            <span className="plugin-uri">{uri}</span>
            <span className="plugin-version">
                v
              {version}
            </span>
          </div>
        </Fragment>
      )
    }
  </div>
);

PedalboardDetails.propTypes = {
  author: PropTypes.shape({
    name: PropTypes.string
  }).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  description: PropTypes.string.isRequired,
  controlPorts: PropTypes.arrayOf(PropTypes.shape({
    default: PropTypes.number,
    max: PropTypes.number,
    min: PropTypes.number,
    name: PropTypes.string
  })).isRequired,
  label: PropTypes.string.isRequired,
  pedalboardCount: PropTypes.number.isRequired,
  screenshotUrl: PropTypes.string.isRequired,
  uri: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default PedalboardDetails;
