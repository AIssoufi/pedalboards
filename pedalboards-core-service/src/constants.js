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

/** Longest searched text, far below the length that SQLite allows for a LIKE pattern */
export const MAX_SEARCH_TEXT_LENGTH = 100;

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

/** Headers that let the CMS and the preview deployments of the frontend call the API */
export const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET',
	'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
};

/** Messages of the API responses, in the language of the apps that show them */
export const MESSAGES = {
	pluginsCount: 'plugins count',
	pluginsFound: 'plugins recherchés avec succès',
	pluginFound: 'Details du plugin envoyés',
	pluginNotFound: 'Plugin non trouvé',
	pluginCreated: 'Ajout réussi',
	pluginUpdated: 'Modification réussie',
	pluginDeleted: 'Suppression réussie',
	invalidInput: 'paramètres invalides',
	databaseError: 'erreur de connexion à la base de données',
	routeNotFound: 'route inconnue',
	internalError: 'erreur interne du serveur'
};
