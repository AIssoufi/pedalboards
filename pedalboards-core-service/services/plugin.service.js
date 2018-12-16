// Dependencies
import { MongoClient, ObjectID } from 'mongodb';

// Configuration
const url = process.env.URL || 'mongodb://localhost:27017'; // Connection URL
const dbName = process.env.DB || 'mbds'; // Database Name
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

const findPlugins = (page = 1, pagesize = 10, filter) => connexionMongo()
	.then(collection => filter ?
		collection.find({
			$or: Object.keys(filter).map(key => {
				return {
					[key]: {
						$regex: `.*${filter[key]}.*`,
						$options: "i"
					}
				}
			})
		}) :
		collection.find())
	.then(collection => Promise.all([
		collection.count(),
		collection.skip(page * pagesize - pagesize)
			.limit(pagesize)
			.toArray()
	])).then(responses => {
		return {
			data: responses[1].sort((a, b) => {
				if (a.nom < b.nom)
					return -1;
				if (a.nom > b.nom)
					return 1;
				return 0;
			}),
			count: responses[0]
		}
	});

const findPluginById = id => connexionMongo()
	.then(collection => collection.findOne({ "_id": ObjectID(id) }));

const createPlugin = formData => connexionMongo()
	.then(collection => collection.insert(formData))
	.then(plugins => plugins.ops[0]);

const updatePlugin = (id, formData) => connexionMongo()
	.then(collection => collection.replaceOne(
		{ "_id": ObjectID(id) },
		formData));

const deletePlugin = (id, page = 1, pagesize = 10, filter) => {
	let deletedCount = -1;
	return connexionMongo()
		.then(collection => collection.deleteOne({ "_id": ObjectID(id) }))
		.then(reponse => {
			console.log("deletedCount : ", reponse.deletedCount);
			deletedCount = reponse.deletedCount;
			return findPlugins(page, pagesize, filter)
		})
		.then(response => {
			console.log("newData : ", response.data);
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
	findPluginById,
	createPlugin,
	updatePlugin,
	deletePlugin,
	test
}