// Dev server check of a web app, run by the CI and by `pnpm run check:dev-server` from the folder
// of the app: starts its `dev` script on a free port, checks that the page and each of its local
// scripts answer, then stops the server. The app's dev script must accept the `--port`, `--host`
// and `--strictPort` options of Vite.
import { spawn } from 'node:child_process';
import net from 'node:net';
import { setTimeout as wait } from 'node:timers/promises';

import {
  ANY_FREE_PORT,
  DEV_SCRIPT,
  ERROR_EXCERPT_LENGTH_CHARS,
  HOST,
  NO_SUCH_PROCESS_ERROR,
  REQUEST_TIMEOUT_MS,
  RETRY_DELAY_MS,
  STARTUP_TIMEOUT_MS,
  STOP_TIMEOUT_MS,
} from './constants.mjs';
import {
  describeStop,
  findLocalScriptUrls,
  hasStopped,
  isHtmlType,
  isJavaScriptType,
} from './utils.mjs';

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
 * Sends one GET request and reads the body of the answer.
 *
 * @param {string} url - URL to request.
 * @returns {Promise<Response>} The answer, rejected on a network error or a timeout.
 */
const get = url => fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

/**
 * @typedef {Object} WaitForAnswerParams
 * @property {string} url - URL to request.
 * @property {import('node:child_process').ChildProcess} server - Process of the server.
 * @property {number} timeoutMs - Time in milliseconds after which the check gives up.
 */

/**
 * Requests the URL until the server answers, the server stops or the timeout passes.
 *
 * @param {WaitForAnswerParams} params
 * @returns {Promise<Response>} The first answer of the server.
 */
const waitForAnswer = async ({ url, server, timeoutMs }) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (hasStopped(server)) {
      throw new Error(`the server stopped (${describeStop(server)}) before answering`);
    }

    try {
      return await get(url);
    } catch {
      await wait(RETRY_DELAY_MS);
    }
  }

  throw new Error(`no answer from ${url} within ${timeoutMs} ms`);
};

/**
 * Checks that the page answers with HTML, then that each local script it loads answers with
 * JavaScript, which makes the server transform the entry module of the app.
 *
 * @param {Response} page - Answer of the server for the page.
 * @returns {Promise<string[]>} URLs of the scripts that answered.
 */
const checkPageAndScripts = async (page) => {
  const pageType = page.headers.get('content-type');
  const isHtmlPage = page.ok && isHtmlType(pageType);

  if (!isHtmlPage) {
    throw new Error(`${page.url} answered HTTP ${page.status} with ${pageType}, not an HTML page`);
  }

  const scriptUrls = findLocalScriptUrls({ html: await page.text(), pageUrl: page.url });

  if (scriptUrls.length === 0) {
    throw new Error(`${page.url} loads no script of its own`);
  }

  for (const scriptUrl of scriptUrls) {
    const script = await get(scriptUrl);
    const scriptType = script.headers.get('content-type');
    // Reads the whole body, so a module that fails while it streams fails the check
    const body = await script.text();
    const isJavaScriptModule = script.ok && isJavaScriptType(scriptType);

    if (!isJavaScriptModule) {
      const excerpt = body.slice(0, ERROR_EXCERPT_LENGTH_CHARS);

      throw new Error(`${scriptUrl} answered HTTP ${script.status} with ${scriptType}: ${excerpt}`);
    }
  }

  return scriptUrls;
};

/**
 * @typedef {Object} SignalServerParams
 * @property {import('node:child_process').ChildProcess} server - Process of the server, leader of
 * its own process group.
 * @property {NodeJS.Signals} signal - Signal to send, such as `SIGTERM`.
 */

/**
 * Sends a signal to the server and to the processes it started, unless they have all stopped.
 *
 * @param {SignalServerParams} params
 * @returns {void}
 */
const signalServer = ({ server, signal }) => {
  try {
    // A negative PID signals the whole process group of the server
    process.kill(-server.pid, signal);
  } catch (error) {
    // The group can stop between the check of the server and the signal
    const hasGroupStopped = error.code === NO_SUCH_PROCESS_ERROR;

    if (!hasGroupStopped) throw error;
  }
};

/**
 * Stops the server and the processes it started, such as the `vite` process under `pnpm run`,
 * then kills them if they still run after STOP_TIMEOUT_MS.
 *
 * @param {import('node:child_process').ChildProcess} server - Process of the server, leader of its
 * own process group.
 * @returns {Promise<void>} Resolved once the server has stopped.
 */
const stopServer = async (server) => {
  if (hasStopped(server)) return;

  const stopped = new Promise(resolve => server.once('exit', resolve));
  signalServer({ server, signal: 'SIGTERM' });

  const hasStoppedInTime = await Promise.race([
    stopped.then(() => true),
    // Unreferenced, so that the pending timer does not keep the check running once the server stops
    wait(STOP_TIMEOUT_MS, undefined, { ref: false }).then(() => false),
  ]);

  if (!hasStoppedInTime) {
    signalServer({ server, signal: 'SIGKILL' });
    await stopped;
  }
};

/**
 * Starts the dev server of the app of the current folder on a free port, checks that it serves
 * the page and its scripts, and stops it.
 *
 * @returns {Promise<void>} Resolved when the check passes, rejected with the reason otherwise.
 */
const runDevServerCheck = async () => {
  const port = await findFreePort();
  const url = `http://${HOST}:${port}/`;
  const server = spawn(
    'pnpm',
    ['run', DEV_SCRIPT, '--port', String(port), '--host', HOST, '--strictPort'],
    // Leader of a new process group, so that stopping it also stops the server it started
    { detached: true, stdio: 'inherit' },
  );

  try {
    const page = await waitForAnswer({ url, server, timeoutMs: STARTUP_TIMEOUT_MS });
    const scriptUrls = await checkPageAndScripts(page);

    console.log(`Dev server check passed: ${url} served the page and ${scriptUrls.join(', ')}.`);
  } finally {
    await stopServer(server);
  }
};

runDevServerCheck().catch((error) => {
  console.error(`Dev server check failed: ${error.message}`);
  process.exitCode = 1;
});
