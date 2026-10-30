// Dependencies
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

/**
 * Renders an element into a new container attached to the document, so that forms can be
 * submitted and read.
 * @param {React.ReactElement} element element to render
 * @returns {{
 *   container: HTMLDivElement,
 *   rerender: (nextElement: React.ReactElement) => void,
 *   unmount: () => void
 * }} the container, a function that renders new props into it, as a parent would, and a
 * function that unmounts the element and removes the container
 */
const render = (element) => {
  const container = document.createElement('div');
  const renderInContainer = (elementToRender) => {
    act(() => {
      ReactDOM.render(elementToRender, container);
    });
  };

  document.body.appendChild(container);
  renderInContainer(element);

  return {
    container,
    rerender: renderInContainer,
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

/**
 * Submits a form as the browser does, with an event that React handlers can cancel.
 * @param {HTMLFormElement} form form to submit
 */
const submitForm = (form) => {
  act(() => {
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  });
};

export {
  flushPromises,
  render,
  submitForm
};
