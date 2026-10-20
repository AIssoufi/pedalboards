// Constants of the dev server check

/** Script of the app's package.json that starts its development server. */
export const DEV_SCRIPT = 'dev';

/** Loopback address the development server listens on during the check. */
export const HOST = '127.0.0.1';

/** Port number that makes the system choose a free port. */
export const ANY_FREE_PORT = 0;

/** Longest wait for the first answer of the server, which can be slow to start in CI. */
export const STARTUP_TIMEOUT_MS = 60000;

/**
 * Longest wait for one request: the first request of a script can wait for the server to bundle
 * the dependencies, and a server that accepts but never answers must not hang the check.
 */
export const REQUEST_TIMEOUT_MS = 30000;

/** Pause between two attempts while the server starts. */
export const RETRY_DELAY_MS = 500;

/** Longest wait for the server to stop after the termination signal, before it is killed. */
export const STOP_TIMEOUT_MS = 5000;

/** Error code of `process.kill` when no process of the group runs any more. */
export const NO_SUCH_PROCESS_ERROR = 'ESRCH';

/** Longest part of a failing answer that the error message quotes, in characters. */
export const ERROR_EXCERPT_LENGTH_CHARS = 500;
