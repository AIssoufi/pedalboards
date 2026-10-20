// Dependencies
import { MongoClient, ObjectID } from 'mongodb';

// Configuration
const url = process.env.URL || 'mongodb://localhost:27017';
const dbName = process.env.DB || 'mbds';
const collectionName = process.env.COLLECTION || 'pedalboards';

const test = () => MongoClient.connect(url);

const connexionMongo = () => MongoClient.connect(url)
	.then(client => client.db(dbName))
	.then(db => db.collection(collectionName))

const countPlugins = name => connexionMongo()
	.then(collection => name ?
		collection.find({ "name": { $regex: `.*${name}.*`, $options: "i" } }) :
		collection.find())
	.then(collection => collection.count());

// Plugins are listed by name, whatever the case of the first letter, before the page is cut
const PLUGIN_SORT = { name: 1 };
const PLUGIN_COLLATION = { locale: 'en' };

/**
 * Builds the MongoDB query matching a plugin when one of the filtered fields holds the value.
 *
 * @param {Object<string, string>} [filter] - Filtered values by field, such as { brand: 'MDA' }.
 * @returns {Object} The query, empty when there is no filter.
 */
const buildPluginQuery = filter => filter ?
	{
		$or: Object.keys(filter).map(key => ({
			[key]: {
				$regex: `.*${filter[key]}.*`,
				$options: "i"
			}
		}))
	} :
	{};

/**
 * Reads one page of the plugins matching the filter, sorted by name across all the pages.
 *
 * @param {Object} params
 * @param {import('mongodb').Collection} params.collection - Collection of the plugins.
 * @param {number} params.page - Number of the page, from 1.
 * @param {number} params.pagesize - Number of plugins per page.
 * @param {Object<string, string>} [params.filter] - Filtered values by field.
 * @returns {Promise<{ data: Object[], count: number }>} The plugins of the page and the number
 * of plugins matching the filter.
 */
const findPluginPage = ({ collection, page, pagesize, filter }) => {
	const cursor = collection.find(buildPluginQuery(filter))
		.sort(PLUGIN_SORT)
		.collation(PLUGIN_COLLATION);

	// count ignores the skip and the limit, so it gives the number of matching plugins
	return Promise.all([
		cursor.count(),
		cursor.skip(page * pagesize - pagesize)
			.limit(pagesize)
			.toArray()
	]).then(([count, data]) => ({ data, count }));
};

const findPlugins = (page = 1, pagesize = 10, filter) => connexionMongo()
	.then(collection => findPluginPage({ collection, page, pagesize, filter }));

const findPluginById = id => connexionMongo()
	.then(collection => collection.findOne({ "_id": ObjectID(id) }));

const createPlugin = formData => connexionMongo()
	.then(collection => collection.insert(formData))
	.then(plugins => plugins.ops[0]);

const updatePlugin = (id, formData) => connexionMongo()
	.then(collection => collection.replaceOne(
		{ "_id": ObjectID(id) },
		formData)
	);

const deletePlugin = (id, page = 1, pagesize = 10, filter) => {
	let deletedCount = -1;
	return connexionMongo()
		.then(collection => collection.deleteOne({ "_id": ObjectID(id) }))
		.then(reponse => {
			deletedCount = reponse.deletedCount;
			return findPlugins(page, pagesize, filter)
		})
		.then(response => {
			return {
				data: response.data,
				count: response.count,
				deletedCount
			}
		});
}

export {
	connexionMongo,
	countPlugins,
	findPlugins,
	findPluginPage,
	findPluginById,
	createPlugin,
	updatePlugin,
	deletePlugin,
	test
};