// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Utils
import { isFilledText, toPluginActionLabel } from './utils';

// Constants
import { DELETE_ACTION, EDIT_ACTION, VIEW_ACTION } from './constants';

// Style
import './style.scss';

/**
 * Row of the plugin list: the name of a plugin, a link to its page in the store, a link to edit it
 * and a button to delete it. Each action names the plugin it acts on. Without an `id`, it shows
 * no link, and without a `homePageUrl`, no link to the store. It needs a router, for the link to
 * the edit page.
 */
const PluginItem = ({
  id = '', name = '', homePageUrl = '', onDelete
}) => {
  const canEdit = isFilledText(id);
  const canLinkToStore = canEdit && isFilledText(homePageUrl);

  const handleDelete = () => {
    const canDelete = typeof onDelete === 'function';

    if (canDelete) onDelete(id);
  };

  return (
    <div className="plugin">
      <h2 className="title">{name}</h2>
      <div className="controls">
        {canLinkToStore && (
          <a
            href={`${homePageUrl}/plugin/${id}`}
            rel="noopener noreferrer"
            target="_blank"
            className="btn bg-white"
            aria-label={toPluginActionLabel({
              action: VIEW_ACTION, pluginName: name, opensInNewTab: true
            })}
          >
            {VIEW_ACTION}
          </a>
        )}
        {canEdit && (
          <Link
            to={`plugin/edit/${id}`}
            className="btn bg-white"
            aria-label={toPluginActionLabel({ action: EDIT_ACTION, pluginName: name })}
          >
            {EDIT_ACTION}
          </Link>
        )}
        <button
          type="button"
          className="btn bg-white"
          aria-label={toPluginActionLabel({ action: DELETE_ACTION, pluginName: name })}
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
   * Name of the plugin, as `MDA Ambience`.
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
