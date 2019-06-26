// Dependencies
import { branch, compose, renderComponent } from 'recompose';

// HOC
import { Loader } from 'components';

export default BaseComponent => compose(
  branch(
    ({ isLoading }) => isLoading,
    renderComponent(Loader)
  ),
)(BaseComponent);
