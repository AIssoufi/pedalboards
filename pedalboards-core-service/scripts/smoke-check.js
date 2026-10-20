// Smoke check of the core service, run by the CI and by `npm run smoke`: starts the server on a
// free port, waits until it answers an HTTP request, then stops it. It needs no database.
const { spawn } = require('child_process');
const http = require('http');
const net = require('net');
const path = require('path');

// Root of the core service, where the server reads its `.env` file
const SERVICE_ROOT = path.join(__dirname, '..');
// Entry point of the server, started as a child process
const SERVER_ENTRY = path.join(SERVICE_ROOT, 'index.js');
// Loopback address the server is reached on
const HOST = '127.0.0.1';
// Port number that makes the system choose a free port
const ANY_FREE_PORT = 0;
// Longest wait for the first answer: the server transpiles itself with Babel when it starts
const STARTUP_TIMEOUT_MS = 30000;
// Longest wait for one request, so a server that accepts but never answers cannot hang the check
const REQUEST_TIMEOUT_MS = 5000;
// Pause between two attempts while the server starts
const RETRY_DELAY_MS = 500;
// Header set by the CORS middleware of the app on every response, whatever the route: it proves
// that the Express app answered, since no route answers 200 without MongoDB
const CORS_HEADER = 'access-control-allow-origin';

/**
 * Asks the system for a free TCP port by listening on any free port, then releases it.
 *
 * @returns {Promise<number>} A port that was free when the function ran.
 */
const findFreePort = () => new Promise((resolve, reject) => {
  const probe = net.createServer();

  probe.once('error', reject);
  probe.listen(ANY_FREE_PORT, HOST, () => {
    const { port } = probe.address();

    probe.close(() => resolve(port));
  });
});

/**
 * Sends one GET request and discards the body of the response.
 *
 * @param {string} url - URL to request.
 * @returns {Promise<http.IncomingMessage>} The response, rejected on a network error or a timeout.
 */
const get = url => new Promise((resolve, reject) => {
  const request = http.get(url, { timeout: REQUEST_TIMEOUT_MS }, (response) => {
    response.resume();
    resolve(response);
  });

  request.once('timeout', () => request.destroy(new Error(`no answer within ${REQUEST_TIMEOUT_MS} ms`)));
  request.once('error', reject);
});

/**
 * Waits for the given duration.
 *
 * @param {number} durationMs - Duration in milliseconds.
 * @returns {Promise<void>} A promise resolved after the duration.
 */
const wait = durationMs => new Promise(resolve => setTimeout(resolve, durationMs));

/**
 * Tells whether a child process has stopped, by exiting or by a signal.
 *
 * @param {import('child_process').ChildProcess} child - Child process to check.
 * @returns {boolean} True once the process has stopped.
 */
const hasStopped = child => child.exitCode !== null || child.signalCode !== null;

/**
 * Describes how a stopped child process ended.
 *
 * @param {import('child_process').ChildProcess} child - Stopped child process.
 * @returns {string} The signal that stopped it, or its exit code.
 */
const describeStop = child => (
  child.signalCode ? `signal ${child.signalCode}` : `exit code ${child.exitCode}`
);

/**
 * Requests the URL until the server answers, the server stops or the timeout passes.
 *
 * @param {Object} params
 * @param {string} params.url - URL to request.
 * @param {import('child_process').ChildProcess} params.server - Process of the server.
 * @param {number} params.timeoutMs - Time in milliseconds after which the check gives up.
 * @returns {Promise<http.IncomingMessage>} The first response of the server.
 */
const waitForAnswer = async ({ url, server, timeoutMs }) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (hasStopped(server)) {
      throw new Error(`the server stopped (${describeStop(server)}) before answering`);
    }

    try {
      return await get(url);
    } catch (error) {
      await wait(RETRY_DELAY_MS);
    }
  }

  throw new Error(`no answer from ${url} within ${timeoutMs} ms`);
};

/**
 * Starts the server on a free port, checks that the Express app answers, and stops the server.
 *
 * @returns {Promise<void>} Resolved when the check passes, rejected with the reason otherwise.
 */
const runSmokeCheck = async () => {
  const port = await findFreePort();
  const url = `http://${HOST}:${port}/`;
  const server = spawn(process.execPath, [SERVER_ENTRY], {
    cwd: SERVICE_ROOT,
    env: { ...process.env, PORT: String(port) },
    stdio: 'inherit'
  });

  try {
    const response = await waitForAnswer({ url, server, timeoutMs: STARTUP_TIMEOUT_MS });

    if (!response.headers[CORS_HEADER]) {
      throw new Error(`${url} answered without the ${CORS_HEADER} header of the app`);
    }

    console.log(`Smoke check passed: ${url} answered with HTTP ${response.statusCode}.`);
  } finally {
    server.kill();
  }
};

runSmokeCheck().catch((error) => {
  console.error(`Smoke check failed: ${error.message}`);
  process.exitCode = 1;
});
