// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Content of the tooltip of a filter link on a plugin card: the name of the filter, then what a
 * click on the link filters the plugins by. Renders nothing without a value, since the link
 * would filter on nothing.
 */
const FilterTooltipContent = ({ heading = '', value = '', kind = '' }) => {
  if (!value) return null;

  const sentenceEnd = kind ? ` ${kind}.` : '.';

  return (
    <>
      {heading && <b>{heading}</b>}
      {heading && <br />}
      <i>
        Click to filter plugin
        <br />
        {'by '}
        <b>{value}</b>
        {sentenceEnd}
      </i>
    </>
  );
};

FilterTooltipContent.propTypes = {
  /** Name of the filter, shown in bold on the first line, such as 'Brand'. @default '' */
  heading: PropTypes.string,
  /** Value the link filters on, such as the brand of the plugin. @default '' */
  value: PropTypes.string,
  /** Plural of what the value is, ending the sentence, such as 'brands'. @default '' */
  kind: PropTypes.string
};

export default FilterTooltipContent;
