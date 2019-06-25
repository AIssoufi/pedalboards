// Dependencies
import { createSelector } from 'reselect';

const selectPlugins = createSelector(
  state => state.plugin,
  (plugin) => {
    const {
      data: plugins,
      elementCount,
      countPlugins,
      isFetching
    } = plugin;

    return {
      plugins,
      elementCount,
      countPlugins,
      isFetching
    };
  }
);

export default selectPlugins;
