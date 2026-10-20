/** Plugins that seed the database */
export const SEED_DATA_URL = new URL('../data/plugins.json', import.meta.url);

/** Migration that inserts the seed plugins, written by generate-seed-migration.js */
export const SEED_MIGRATION_URL = new URL('../migrations/0002_seed_plugins.sql', import.meta.url);

/** Columns of the plugins table, in the order of the generated INSERT statements */
export const PLUGIN_COLUMNS = [
	'id',
	'name',
	'label',
	'brand',
	'description',
	'uri',
	'version',
	'stable',
	'pedalboardCount',
	'screenshotUrl',
	'thumbnailUrl',
	'imageWidth',
	'imageHeight',
	'author',
	'categories',
	'controlPorts'
];

/** Bundle of the Worker, written by `wrangler deploy --dry-run --outdir dist` */
export const WORKER_BUNDLE_URL = new URL('../dist/index.js', import.meta.url);

/** Code that only the write routes use: none of it may ship in the deployed Worker */
export const WRITE_ONLY_MARKERS = [
	'createWriteRouter',
	'createImageRouter',
	'multer',
	'busboy',
	'INSERT INTO plugins',
	'UPDATE plugins',
	'DELETE FROM plugins'
];
