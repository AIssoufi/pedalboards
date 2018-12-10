var router = require('express').Router();
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

import {
  countPlugins,
  findPlugins,
  findPluginById,
  createPlugin,
  updatePlugin,
  deletePlugin
} from '../services/plugin.service';

router.get('/api/plugins/count', function (req, res) {
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
router.get('/api/plugins', function (req, res) {
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
router.get('/api/plugin/:id', function (req, res) {
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
router.post('/api/plugin', multerData.single('image'), function (req, res) {
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
    pedalboardCount: req.body.pedalboardCount,
    screenshotUrl: getServerAdress() + "/screenshots" + req.file.filename,
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
router.put('/api/plugin/:id', multerData.fields([]), function (req, res) {
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
router.delete('/api/plugin/:id', function (req, res) {
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

module.exports = router;