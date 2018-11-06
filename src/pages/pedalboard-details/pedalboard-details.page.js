import React from 'react';
import PropTypes from 'prop-types';

import "./pedalboard-details.page.scss";

const PedalboardDetailsPage = props => (
  <div className="pedalboard-details-container">
    <div className="pedalboard">
      <header>
        <div className="author">
          <span className="author-name">David Robillard</span>
          <a href="http://drobilla.net" target="_blank">http://drobilla.net</a>
        </div>
        <div className="count-container">
          <a className="count" href="/?plugin_uri=http%3A//drobilla.net/plugins/fomp/autowah&amp;plugin_label=Wah">
            <span>16</span>
          </a>
          <span className="pedalboard-count-text">Pedalboards using it</span>
        </div>
      </header>
      <h2>Auto-wah</h2>
      <div className="plugin-media-container">
        <img className="plugin-media" src="https://api.moddevices.com/v2/lv2/plugins/56c4bc95770cb318f9cd416a/screenshot/" alt="Plugin screenshot" />
      </div>
      <div className="category-container">
        <a href="/plugins?category=Filter" className="plugin-category">Filter</a>
      </div>
      <p className="pedalboard-description">Fomp is an LV2 port of the MCP, VCO, FIL, and WAH plugins by Fons Adriaensen. The auto-wah, is basically a combination of an envelope follower and a resonant lowpass filter. For increasing level both the frequency and the bandwidth of the filter will increase. How much is controlled by 'Drive'. For a normal wah, use a pedal to control 'Frequency' and set 'Drive' to zero.</p>

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

            <tr>
              <td>Drive</td>
              <td>0.00</td>
              <td>-20.00</td>
              <td>20.00</td>
            </tr>

            <tr>
              <td>Decay</td>
              <td>0.00</td>
              <td>0.00</td>
              <td>1.00</td>
            </tr>

            <tr>
              <td>Range</td>
              <td>0.50</td>
              <td>0.00</td>
              <td>1.00</td>
            </tr>

            <tr>
              <td>Freq</td>
              <td>0.25</td>
              <td>0.00</td>
              <td>1.00</td>
            </tr>

            <tr>
              <td>Mix</td>
              <td>0.75</td>
              <td>0.00</td>
              <td>1.00</td>
            </tr>

          </tbody>
        </table>
      </div>

      <div className="plugin-misc-info-container">
        <span className="plugin-uri">http://drobilla.net/plugins/fomp/autowah</span>
        <span className="plugin-version">v.1:0.0-7</span>
      </div>
    </div>
  </div>
);

PedalboardDetailsPage.propTypes = {

}

export default PedalboardDetailsPage;
