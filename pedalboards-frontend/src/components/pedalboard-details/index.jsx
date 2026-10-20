// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// HOC
import { withLoader } from 'hoc';

// Utils
import { buildPluginFilterLink, isPluginFilterValue } from 'utils/plugin-filter';
import { isControlPort, toCellText } from './utils';

// Style
import './style.scss';

/**
 * Details of a plugin: its author and URI, how many pedalboards use it, its label, screenshot,
 * categories linking to the plugins of each category, description, control ports and version.
 * A missing field shows nothing in its place.
 */
const PedalboardDetails = ({
  author = {}, uri = '', pedalboardCount = 0, label = '', screenshotUrl = '', categories = [],
  controlPorts = [], version = '', description = ''
}) => {
  const { name: authorName = '' } = author || {};
  const categoryList = Array.isArray(categories) ? categories.filter(isPluginFilterValue) : [];
  const controlPortList = Array.isArray(controlPorts) ? controlPorts.filter(isControlPort) : [];

  return (
    <div className="pedalboard-details">
      <header>
        <div className="author">
          <span className="author-name">
            {' '}
            {authorName}
          </span>
          {uri && <a href={uri} target="_blank" rel="noopener noreferrer">{uri}</a>}
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
      {label && <h2>{label}</h2>}
      <div className="plugin-media-container">
        {screenshotUrl && (
          <img className="plugin-media" src={screenshotUrl} alt="Plugin screenshot" />
        )}
      </div>
      <div className="category-container">
        {categoryList.map((category, index) => (
          <Link
            to={buildPluginFilterLink({ field: 'categories', value: category })}
            key={`${category}-${index}`}
            className="plugin-category"
          >
            {category}

          </Link>
        ))}
      </div>
      <p className="pedalboard-description">{description}</p>
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
            {controlPortList.map((controlPort, index) => (
              <tr key={index}>
                <td>{toCellText(controlPort.name)}</td>
                <td>{toCellText(controlPort.default)}</td>
                <td>{toCellText(controlPort.min)}</td>
                <td>{toCellText(controlPort.max)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="plugin-misc-info-container">
        <span className="plugin-uri">{uri}</span>
        {version && (
          <span className="plugin-version">
            v
            {version}
          </span>
        )}
      </div>
    </div>
  );
};

PedalboardDetails.propTypes = {
  /** Author of the plugin, whose name heads the details. @default {} */
  author: PropTypes.shape({
    name: PropTypes.string
  }),
  /**
   * Categories, each linking to the plugins of that category. Blank ones are skipped.
   * @default []
   */
  categories: PropTypes.arrayOf(PropTypes.string),
  /** Description, shown as plain text. @default '' */
  description: PropTypes.string,
  /**
   * Control ports, one row each in the table. Entries that are not objects are skipped, and a
   * field that is neither a text nor a number leaves its cell empty.
   * @default []
   */
  controlPorts: PropTypes.arrayOf(PropTypes.shape({
    default: PropTypes.number,
    max: PropTypes.number,
    min: PropTypes.number,
    name: PropTypes.string
  })),
  /** Label, shown as the title. Hidden when empty. @default '' */
  label: PropTypes.string,
  /** Number of pedalboards using the plugin. Hidden when 0. @default 0 */
  pedalboardCount: PropTypes.number,
  /** URL of the screenshot. The image is omitted when empty. @default '' */
  screenshotUrl: PropTypes.string,
  /** URI of the plugin, linked in the header. The link is omitted when empty. @default '' */
  uri: PropTypes.string,
  /** Version, shown after a 'v'. Hidden when empty. @default '' */
  version: PropTypes.string
};

export default withLoader(PedalboardDetails);
