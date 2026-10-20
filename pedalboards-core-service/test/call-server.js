import { httpServerHandler } from 'cloudflare:node';

/**
 * Reads the body of a request as a browser sends it: a form as multipart/form-data, other text as
 * is.
 *
 * @param {Object} params
 * @param {FormData} [params.form] - Form to send.
 * @param {string} [params.body] - Raw body to send in place of a form.
 * @param {string} [params.contentType] - Type of the raw body.
 * @returns {Promise<{ bytes?: ArrayBuffer, contentType?: string }>} The bytes of the body and their type, empty without a body.
 */
const encodeBody = async ({ form, body, contentType }) => {
	if (form) {
		const formRequest = new Request('https://form.test', { method: 'POST', body: form });
		return { bytes: await formRequest.arrayBuffer(), contentType: formRequest.headers.get('Content-Type') };
	}
	if (body !== undefined) {
		return { bytes: new TextEncoder().encode(body).buffer, contentType };
	}
	return {};
};

/**
 * Calls a test server, started with `createApp(...).listen(port)`, as a browser does: the body
 * goes with its length, which Express needs to read it.
 *
 * @param {Object} params
 * @param {number} params.port - Port of the server.
 * @param {string} params.path - Path and query under /api, such as `/plugin/abgate`.
 * @param {string} [params.method] - Method of the request, `GET` by default.
 * @param {FormData} [params.form] - Form to send as multipart/form-data.
 * @param {string} [params.body] - Raw body to send in place of a form.
 * @param {string} [params.contentType] - Type of the raw body.
 * @returns {Promise<Response>} The response of the server.
 */
export const callServer = async ({ port, path, method = 'GET', form, body, contentType }) => {
	const { bytes, contentType: bodyType } = await encodeBody({ form, body, contentType });
	const init = { method };
	if (bytes) {
		init.body = bytes;
		init.headers = { 'Content-Type': bodyType, 'Content-Length': String(bytes.byteLength) };
	}
	return httpServerHandler({ port }).fetch(new Request(`https://pedalboards.issoufi.fr/api${path}`, init));
};
