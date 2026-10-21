/**
 * Props of {@link FilterTooltipContent}.
 *
 * @typedef {Object} FilterTooltipContentProps
 * @property {string} [heading=''] - Name of the filter, shown in bold on the first line, such as
 *   'Brand'.
 * @property {string} [value=''] - Value the link filters on, such as the brand of the plugin.
 * @property {string} [kind=''] - Plural of what the value is, ending the sentence, such as
 *   'brands'.
 */

/**
 * Content of the tooltip of a filter link on a plugin card: the name of the filter, then what a
 * click on the link filters the plugins by. Renders nothing without a value, since the link
 * would filter on nothing.
 *
 * @param {FilterTooltipContentProps} props - Props of the component.
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

export default FilterTooltipContent;
