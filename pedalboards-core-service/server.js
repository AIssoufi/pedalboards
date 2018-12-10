import express from 'express';
import multer from 'multer'; // pour les formulaires multiparts
import http from 'http';
import bodyParser from 'body-parser'; // Pour les formulaires standards
import {
	connexionMongo,
	countPlugins,
	findPlugins,
	findPluginById,
	createPlugin,
	updatePlugin,
	deletePlugin
} from './services/plugin.service';


// Constants
const PORT = process.env.PORT || 8080;
const STATIC_FOLDER = 'public';
const STATIC_FOLDER_PATH = __dirname + '/' + STATIC_FOLDER;

// Grobal variable
const app = express();
const server = http.Server(app);
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, STATIC_FOLDER_PATH + '/screenshots')
	},
	filename: function (req, file, cb) {
		cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype.split('/')[1]}`)
	}
});
const multerData = multer({
	storage: storage
});


// Paramètres standards du modyle bodyParser
// qui sert à récupérer des paramètres reçus
// par ex, par l'envoi d'un formulaire "standard"
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Ajout du support CROSS DOMAIN
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
});

// Cette ligne indique le répertoire qui contient
// les fichiers statiques: html, css, js, images etc.
app.use(express.static(STATIC_FOLDER_PATH));

const getServerAdress = () => `http://${server.address().address}:${server.address().port}`.replace('::', '127.0.0.1');


// Lance le serveur avec express
server.listen(PORT, function () {
	console.log("static folder --> ", STATIC_FOLDER_PATH)
	console.log('Serveur lancé sur --> ' + getServerAdress())
});

// Ici des routes en :
// http GET (pour récupérer des données)
// http POST : pour insérer des données
// http PUT pour modifier des données
// http DELETE pour supprimer des données

//----------------------------------------------
// Ces routes forment l'API de l'application !!
//----------------------------------------------

// Test de la connexion à la base
app.get('/api/connection', function (req, res) {
	// Pour le moment on simule, mais après on devra
	// réellement se connecte à la base de données
	// et renvoyer une valeur pour dire si tout est ok
	connexionMongo()
		.then(rep => res.status(200).json({
			msg: "connexion établie"
		}))
		.catch(error => res.status(401).json({
			msg: "erreur de connexion err=" + error
		}));

	console.log(process.env.URL, process.env.DB, process.env.COLLECTION)
});

app.get('/api/plugins/count', function (req, res) {
	const name = req.query.name || '';

	countPlugins(name)
		.then(data => res.status(200).json({
			msg: "plugins count",
			data: data
		})).catch(error => res.status(400).json({
			msg: "erreur : " + error
		}));
});

// On va récupérer des plugins par un GET (standard REST) 
// cette fonction d'API peut accepter des paramètres
// pagesize = nombre de plugins par page
// page = no de la page
// Oui, on va faire de la pagination, pour afficher
// par exemple les plugins 10 par 10
app.get('/api/plugins', function (req, res) {
	// Si présent on prend la valeur du param, sinon 1
	const page = parseInt(req.query.page || 1, 10);
	// idem si present on prend la valeur, sinon 10
	const pagesize = parseInt(req.query.pagesize || 10, 10);

	const filter = req.query.filterby || null;

	findPlugins(page, pagesize, filter)
		.then(response => res.status(200).json({
			msg: "plugins recherchés avec succès",
			data: response.data,
			count: response.count,
			currentPage: page,
			numberPages: Math.ceil(response.count / pagesize)
		}))
		.catch(error => res.status(400).json({
			msg: "erreur : " + error
		}));
});

// Récupération d'un seul plugin par son id
app.get('/api/plugin/:id', function (req, res) {
	const id = req.params.id;

	findPluginById(id)
		.then(data => data ?
			res.status(200).json({
				msg: "Details du plugin envoyés",
				data
			}) :
			res.status(404).json({
				msg: "Plugin non trouvé"
			})
		)
		.catch(error => res.status(400).json({
			msg: "erreur lors du find :" + error
		}));

});

// Creation d'un plugin par envoi d'un formulaire
// On fera l'insert par un POST, c'est le standard REST
app.post('/api/plugin', multerData.single('image'), function (req, res) {
	// ----
	// req.file is the `avatar` file
	// req.body will hold the text fields, if there were any
	// ----
	// On supposera qu'on ajoutera un plugin en 
	// donnant son nom et sa cuisine. On va donc 
	// recuperer les données du formulaire d'envoi
	// les params sont dans req.body même si le formulaire
	// est envoyé en multipart

	console.log("req : ", req);
	console.log("req.file : ", req.file);
	console.log("req.body : ", req.body);

	const plugin = {
		author: JSON.parse(req.body.author),
		brand: req.body.brand,
		categories: req.body.categories.trim().split(","),
		controlPorts: JSON.parse(req.body.controlPorts),
		description: req.body.description,
		label: req.body.label,
		name: req.body.name,
		pedalboardCount: req.body.pedalboardCount,
		screenshotUrl: getServerAdress() + "/screenshots/" + req.file.filename,
		uri: req.body.uri,
		version: req.body.version
	}

	console.log("plugin* : ", plugin);

	createPlugin(plugin)
		.then(data => res.status(201).json({
			msg: "Ajout réussi",
			data
		}))
		.catch(error => res.status(400).json({
			msg: "erreur lors de l'insertion:" + error
		}));
});

// Modification d'un plugin, on fera l'update par
// une requête http PUT, c'est le standard REST
app.put('/api/plugin/:id', multerData.fields([]), function (req, res) {
	const id = req.params.id;

	updatePlugin(id, req.body)
		.then(data => res.status(200).json({
			msg: "Modification réussie",
			data
		}))
		.catch(error => res.status(400).json({
			msg: "erreur lors de la modification :" + error
		}));
});

// Suppression d'un plugin
// On fera la suppression par une requête http DELETE
// c'est le standard REST
app.delete('/api/plugin/:id', function (req, res) {
	const id = req.params.id;
	// Si présent on prend la valeur du param, sinon 1
	const page = parseInt(req.query.page || 1, 10);
	// idem si present on prend la valeur, sinon 10
	const pagesize = parseInt(req.query.pagesize || 10, 10);

	const filter = req.query.filterby || null;

	deletePlugin(id, page, pagesize, filter)
		.then(response => res.status(200).json({
			msg: "Suppression réussie",
			data: response.data,
			count: response.count,
			deletedCount: response.deletedCount,
			currentPage: page,
			numberPages: Math.ceil(response.count / pagesize)
		}))
		.catch(error => res.status(400).json({
			msg: "erreur lors de la suppression :" + error
		}));
});