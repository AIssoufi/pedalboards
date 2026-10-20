// Dependencies
import { branch, compose, renderComponent } from 'recompose';

// Components: imported from its own module, since the `components` barrel imports
// `plugin-grid`, which imports this HOC back
import Loader from '../components/loader';

export default BaseComponent => compose(
  branch(
    ({ isLoading }) => isLoading,
    renderComponent(Loader)
  ),
)(BaseComponent);
