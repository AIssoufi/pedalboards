// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Utils
import { isFilledText, toPluginActionLabel, toPluginNames } from './utils';

// Constants
import { DELETE_ACTION, EDIT_ACTION, VIEW_ACTION } from './constants';

// Style
import './style.scss';

/**
 * Row of the plugin list: the label of a plugin as its title, with its name below when it differs,
 * a link to its page in the store, a link to edit it and a button to delete it. Each action names
 * the plugin by its title. Without an `id`, it shows no link, and without a `homePageUrl`, no link
 * to the store. It needs a router, for the link to the edit page.
 */
const PluginItem = ({
  id = '', label = '', name = '', homePageUrl = '', onDelete
}) => {
  const { title, subtitle } = toPluginNames({ label, name });
  const hasSubtitle = subtitle !== '';
  const canEdit = isFilledText(id);
  const canLinkToStore = canEdit && isFilledText(homePageUrl);

  const handleDelete = () => {
    const canDelete = typeof onDelete === 'function';

    if (canDelete) onDelete(id);
  };

  return (
    <div className="plugin">
      <div className="names">
        <h2 className="title">{title}</h2>
        {hasSubtitle && <p className="name">{subtitle}</p>}
      </div>
      <div className="controls">
        {canLinkToStore && (
          <a
            href={`${homePageUrl}/plugin/${id}`}
            rel="noopener noreferrer"
            target="_blank"
            className="btn bg-white"
            aria-label={toPluginActionLabel({
              action: VIEW_ACTION, pluginName: title, opensInNewTab: true
            })}
          >
            {VIEW_ACTION}
          </a>
        )}
        {canEdit && (
          <Link
            to={`plugin/edit/${id}`}
            className="btn bg-white"
            aria-label={toPluginActionLabel({ action: EDIT_ACTION, pluginName: title })}
          >
            {EDIT_ACTION}
          </Link>
        )}
        <button
          type="button"
          className="btn bg-white"
          aria-label={toPluginActionLabel({ action: DELETE_ACTION, pluginName: title })}
          onClick={handleDelete}
        >
          {DELETE_ACTION}
        </button>
      </div>
    </div>
  );
};

PluginItem.propTypes = {
  /**
   * Identifier of the plugin, in the addresses of its pages and given to `onDelete`. A blank one
   * hides both links.
   * @default ''
   */
  id: PropTypes.string,
  /**
   * Label of the plugin, which the API sorts the list on, shown as the title, as `Ambience`. A
   * blank label falls back to `name`, then to `UNTITLED_PLUGIN_TEXT`.
   * @default ''
   */
  label: PropTypes.string,
  /**
   * Name of the plugin, shown below the title when it differs from it, as `MDA Ambience`.
   * @default ''
   */
  name: PropTypes.string,
  /**
   * Address of the store, before the path of the plugin's page. A blank one hides the link to the
   * store.
   * @default ''
   */
  homePageUrl: PropTypes.string,
  /** Called with `id` when the delete button is clicked; the button does nothing without it. */
  onDelete: PropTypes.func
};

export default PluginItem;
