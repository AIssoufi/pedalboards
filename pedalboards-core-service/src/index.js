// Entry of the deployed Worker. It mounts the read router only, so no write route ships in its
// bundle (`pnpm check:bundle` checks it).
import { httpServerHandler } from 'cloudflare:node';
import { env } from 'cloudflare:workers';

import { createApp } from './app.js';
import { WORKER_SERVER_PORT } from './constants.js';
import { createReadRouter } from './routes/read.js';

createApp(createReadRouter(env.DB)).listen(WORKER_SERVER_PORT);

export default httpServerHandler({ port: WORKER_SERVER_PORT });
