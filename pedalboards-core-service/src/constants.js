/** Port of the Express server inside the Worker: only a key that links the fetch handler to it */
export const WORKER_SERVER_PORT = 8080;

/** Page served when the query gives no valid page */
export const DEFAULT_PAGE = 1;

/** Largest page number, which keeps the row offset a safe integer */
export const MAX_PAGE = 1_000_000;

/** Number of plugins per page when the query gives no valid page size */
export const DEFAULT_PAGE_SIZE = 10;

/** Largest page size, so that one request never reads the whole table */
export const MAX_PAGE_SIZE = 100;

/**
 * Longest LIKE pattern of a search, in UTF-8 bytes, its surrounding `%` and its escapes included:
 * D1 answers a longer one with an error, measured on the production database in October 2026.
 * So a text of 48 ASCII letters is the longest one, and a `%` or an `é` costs two bytes.
 */
export const MAX_SEARCH_PATTERN_BYTES = 50;

/** Digits only: no sign, no decimal point, no exponent and no space */
export const POSITIVE_INTEGER_PATTERN = /^[0-9]+$/;

/** Query parameter that searches one field, such as `filterby[brand]=mda` */
export const FILTER_PARAMETER_PATTERN = /^filterby\[(.*)\]$/;

/**
 * SQL condition of each searchable field, true when the field holds the bound LIKE pattern.
 * Only these fields can be searched: a field name of the request never reaches the SQL.
 */
export const PLUGIN_FILTER_CONDITIONS = {
	brand: "brand LIKE ? ESCAPE '\\'",
	categories: "EXISTS (SELECT 1 FROM json_each(plugins.categories) WHERE value LIKE ? ESCAPE '\\')",
	label: "label LIKE ? ESCAPE '\\'",
	name: "name LIKE ? ESCAPE '\\'"
};

/** Order of the plugin lists: by name whatever the case, then by id, so that pages never overlap */
export const PLUGIN_ORDER_BY = 'ORDER BY name COLLATE NOCASE, id';

/** Columns that the write routes may set: the id, the stability flag and the image size stay as they are */
export const PLUGIN_WRITABLE_COLUMNS = [
	'name',
	'label',
	'brand',
	'description',
	'uri',
	'version',
	'pedalboardCount',
	'screenshotUrl',
	'author',
	'categories',
	'controlPorts'
];

/** Columns that hold JSON text */
export const PLUGIN_JSON_COLUMNS = ['author', 'categories', 'controlPorts'];

/** Prefix of the keys of the plugin images in the R2 bucket of the local entry */
export const PLUGIN_IMAGE_KEY_PREFIX = 'plugins/';

/** Route, under /api, that serves the plugin images in the local entry */
export const PLUGIN_IMAGE_ROUTE = '/images';

/** Types of the images that the CMS may upload. SVG is left out: it can run scripts */
export const PLUGIN_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

/** Largest uploaded image: 5 MiB, below MAX_FORM_BYTES */
export const MAX_PLUGIN_IMAGE_BYTES = 5 * 1024 * 1024;

/** Largest multipart form that the write routes read: room for the largest image and the text fields */
export const MAX_FORM_BYTES = 6 * 1024 * 1024;

/** Lowest and highest HTTP statuses of a client error, which body-parser gives a bad body */
export const CLIENT_ERROR_STATUS = { min: 400, max: 499 };

/** Headers that let the CMS and the preview deployments of the frontend call the API */
export const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET',
	'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
};

/** Methods that the CMS may send to the local entry, which serves the write routes */
export const WRITE_CORS_METHODS = 'GET, POST, PUT, DELETE, OPTIONS';

/**
 * Messages of the API responses. Those of the former Express service keep their wording, which
 * clients may read, and the new ones are in English.
 */
export const MESSAGES = {
	pluginsCount: 'plugins count',
	pluginsFound: 'plugins recherchés avec succès',
	pluginFound: 'Details du plugin envoyés',
	pluginNotFound: 'Plugin non trouvé',
	pluginCreated: 'Ajout réussi',
	pluginUpdated: 'Modification réussie',
	pluginDeleted: 'Suppression réussie',
	pluginExists: 'a plugin with this name already exists',
	imageNotFound: 'image not found',
	invalidInput: 'invalid parameters',
	databaseError: 'erreur de connexion à la base de données',
	routeNotFound: 'unknown route',
	internalError: 'internal server error'
};
