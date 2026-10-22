// Dependencies
import { Link } from 'react-router';

// Components
import Loader from '../loader';

// Utils
import { buildPluginFilterLink, isPluginFilterValue } from '../../utils/plugin-filter';
import { toScreenshotAlt } from '../../utils/screenshot-alt';
import { isControlPort, toCellText } from './utils';

// Style
import './style.scss';

/**
 * Control port of a plugin, one row of the table of the details.
 *
 * @typedef {Object} ControlPort
 * @property {number} [default] - Value of the port when the plugin loads.
 * @property {number} [max] - Highest value of the port.
 * @property {number} [min] - Lowest value of the port.
 * @property {string} [name] - Name of the port.
 */

/**
 * Props of {@link PedalboardDetails}.
 *
 * @typedef {Object} PedalboardDetailsProps
 * @property {boolean} [isLoading=false] - Shows the loader in place of the details while truthy.
 * @property {{ name?: string }} [author={}] - Author of the plugin, whose name heads the details.
 * @property {Array<string>} [categories=[]] - Categories, each linking to the plugins of that
 *   category. Blank ones are skipped.
 * @property {string} [description=''] - Description, shown as plain text.
 * @property {Array<ControlPort>} [controlPorts=[]] - Control ports, one row each in the table.
 *   Entries that are not objects are skipped, and a field that is neither a text nor a number
 *   leaves its cell empty.
 * @property {string} [label=''] - Label, shown as the title and naming the screenshot for screen
 *   readers. Hidden when empty.
 * @property {number} [pedalboardCount=0] - Number of pedalboards using the plugin. Hidden when 0.
 * @property {string} [screenshotUrl=''] - URL of the screenshot. The image is omitted when empty.
 * @property {string} [uri=''] - URI of the plugin, linked in the header. The link is omitted when
 *   empty.
 * @property {string} [version=''] - Version, shown after a 'v'. Hidden when empty.
 */

/**
 * Details of a plugin: its author and URI, how many pedalboards use it, its label, screenshot,
 * categories linking to the plugins of each category, description, control ports and version.
 * A missing field shows nothing in its place. Shows the loader in their place while `isLoading`
 * is truthy.
 *
 * @param {PedalboardDetailsProps} props - Props of the component.
 */
const PedalboardDetails = ({
  author = {}, uri = '', pedalboardCount = 0, label = '', screenshotUrl = '', categories = [],
  controlPorts = [], version = '', description = '', isLoading = false
}) => {
  if (isLoading) return <Loader />;

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
      {label && <h1>{label}</h1>}
      <div className="plugin-media-container">
        {screenshotUrl && (
          <img className="plugin-media" src={screenshotUrl} alt={toScreenshotAlt(label)} />
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

export default PedalboardDetails;
