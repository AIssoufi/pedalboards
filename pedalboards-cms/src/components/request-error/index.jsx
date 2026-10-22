// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

// Utils
import { isNonEmptyText } from 'utils/text';

// Style
import './style.scss';

/**
 * Alert that shows the message of a failed request, above a list or in a form. Renders nothing
 * without a message.
 */
const RequestError = ({ message = '' }) => {
  if (!isNonEmptyText(message)) return null;

  return <p className="request-error" role="alert">{message}</p>;
};

RequestError.propTypes = {
  /**
   * Message of the failed request.
   * @default ''
   */
  message: PropTypes.string
};

export default RequestError;
