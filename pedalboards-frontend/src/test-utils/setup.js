/**
 * Setup of every test file. No test reaches the network: a fetch that a test does not answer
 * itself, with `vi.spyOn(window, 'fetch')`, rejects at once. Restoring a spy brings this stub
 * back, never the fetch of Node.js.
 */
const unansweredFetch = url => Promise.reject(
  new TypeError(`No test answers the fetch of ${url}: answer it with vi.spyOn(window, 'fetch')`)
);

window.fetch = unansweredFetch;
globalThis.fetch = unansweredFetch;
