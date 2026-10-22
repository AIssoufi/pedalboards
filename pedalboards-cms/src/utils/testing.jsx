// Dependencies
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

/**
 * Renders an element into a new container attached to the document, so that forms can be
 * submitted and read.
 * @param {React.ReactElement} element element to render
 * @returns {{ container: HTMLDivElement, unmount: () => void }} the container and a function
 * that unmounts the element and removes the container
 */
const render = (element) => {
  const container = document.createElement('div');

  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(element, container);
  });

  return {
    container,
    unmount: () => {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
    }
  };
};

/**
 * Waits until the settled promises, such as the mocked requests of a component, have run
 * their callbacks.
 * @returns {Promise<void>} a promise resolved on the next turn of the event loop
 */
const flushPromises = () => new Promise(resolve => setImmediate(resolve));

export {
  flushPromises,
  render
};
