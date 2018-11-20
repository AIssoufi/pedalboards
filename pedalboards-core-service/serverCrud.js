const express  = require('express');
const app      = express();
const port     = process.env.PORT || 8080;
const server   = require('http').Server(app);
// Pour les formulaires standards
const bodyParser = require('body-parser');
// pour les formulaires multiparts
var multer = require('multer');
var multerData = multer();

// Cette ligne indique le répertoire qui contient
// les fichiers statiques: html, css, js, images etc.
app.use(express.static(__dirname + '/public'));
// Paramètres standards du modyle bodyParser
// qui sert à récupérer des paramètres reçus
// par ex, par l'envoi d'un formulaire "standard"
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Lance le serveur avec express
server.listen(port);

console.log("Serveur lancé sur le port : " + port);

//------------------
// ROUTES
//------------------
// Utile pour indiquer la home page, dans le cas
// ou il ne s'agit pas de public/index.html
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
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
app.get('/api/connection', function(req, res) {
	// Pour le moment on simule, mais après on devra
	// réellement se connecte à la base de données
	// et renvoyer une valeur pour dire si tout est ok
   res.send("Test de connexion");
});

// On va récupérer des restaurants par un GET (standard REST) 
// cette fonction d'API peut accepter des paramètres
// pagesize = nombre de restaurants par page
// page = no de la page
// Oui, on va faire de la pagination, pour afficher
// par exemple les restaurants 10 par 10
app.get('/api/restaurants', function(req, res) {
	// Si présent on prend la valeur du param, sinon 1
    let page = req.query.page || 1;
    // idem si present on prend la valeur, sinon 10
    let pagesize = req.query.pagesize || 10;

    // On simule une réponse
    let message = "<h1>/api/restaurants: on demande des restaurants";
    message += " avec ces params:</h1>";
    message += "<ul><li>Nb = " + pagesize + "</li><li>Page ";
    message += page + "</li></ul>";

    let reponse = {
    	msg : message
    }
    res.send(JSON.stringify(reponse));
});

// Récupération d'un seul restaurant par son id
app.get('/api/restaurants/:id', function(req, res) {
	var id = req.params.id;

    // On simule une réponse
    let message = "<h1>/api/restaurants/" + id + " : on demande "
    message += " le détail du restaurant par son id=" + id +"</h1>";

   let reponse = {
    	msg : message
    }
    res.send(JSON.stringify(reponse));
});

// Creation d'un restaurant par envoi d'un formulaire
// On fera l'insert par un POST, c'est le standard REST
app.post('/api/restaurants', multerData.fields([]), function(req, res) {
	// On supposera qu'on ajoutera un restaurant en 
	// donnant son nom et sa cuisine. On va donc 
	// recuperer les données du formulaire d'envoi
	// les params sont dans req.body même si le formulaire
	// est envoyé en multipart

	// Normalement on devrait renvoyer l'id du restaurant créé
	// Là on renvoie juste les paramètres d'appel
	   // On simule une réponse
    let message = "<h1>Création d'un restaurant avec les paramètres" 
    message += " nom = " + req.body.nom + " et cuisine= " + req.body.cuisine;

   let reponse = {
    	msg : message
    }
    res.send(JSON.stringify(reponse));
});

// Modification d'un restaurant, on fera l'update par
// une requête http PUT, c'est le standard REST
app.put('/api/restaurants/:id', multerData.fields([]), function(req, res) {
	var id = req.params.id;

    let message = "<h1>Modification du restaurant id=" + id + " avec les paramètres" 
    message += " nom = " + req.body.nom + " et cuisine= " + req.body.cuisine;

   let reponse = {
    	msg : message
    }
    res.send(JSON.stringify(reponse));

});

// Suppression d'un restaurant
// On fera la suppression par une requête http DELETE
// c'est le standard REST
app.delete('/api/restaurants/:id', function(req, res) {
	var id = req.params.id;

    let message = "<h1>Suppresion du restaurant id=" + id + "</h1>";

   	let reponse = {
    	msg : message
    }

 	// Normalement on doit renvoyer le nombre de suppression
    res.send(JSON.stringify(reponse));
})

