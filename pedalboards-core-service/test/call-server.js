import { httpServerHandler } from 'cloudflare:node';

/**
 * Calls a test server, started with `createApp(...).listen(port)`, as a browser does: a form goes
 * as multipart/form-data with its length, which Express needs to read a body.
 *
 * @param {Object} params
 * @param {number} params.port - Port of the server.
 * @param {string} params.path - Path and query under /api, such as `/plugin/abgate`.
 * @param {string} [params.method] - Method of the request, `GET` by default.
 * @param {FormData} [params.form] - Form to send.
 * @returns {Promise<Response>} The response of the server.
 */
export const callServer = async ({ port, path, method = 'GET', form }) => {
	const init = { method };
	if (form) {
		const formRequest = new Request('https://form.test', { method: 'POST', body: form });
		init.body = await formRequest.arrayBuffer();
		init.headers = {
			'Content-Type': formRequest.headers.get('Content-Type'),
			'Content-Length': String(init.body.byteLength)
		};
	}
	return httpServerHandler({ port }).fetch(new Request(`https://pedalboards.issoufi.fr/api${path}`, init));
};
