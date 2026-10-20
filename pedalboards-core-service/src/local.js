// Entry of the local API, run by `pnpm start:local` on the local D1 and the R2 that wrangler
// simulates. It mounts the write routes of the CMS beside the read routes; the deployed Worker
// (src/index.js) never imports this file.
import { httpServerHandler } from 'cloudflare:node';
import { env } from 'cloudflare:workers';

import { WORKER_SERVER_PORT } from './constants.js';
import { createLocalApp } from './local-app.js';

createLocalApp({ db: env.DB, images: env.IMAGES }).listen(WORKER_SERVER_PORT);

export default httpServerHandler({ port: WORKER_SERVER_PORT });
