// Dependencies
const router = require('express').Router();

// Services
import {
  countPlugins, findPlugins, findPluginById,
  createPlugin, updatePlugin, deletePlugin
} from '../services/plugin.service';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderPath = `${STATIC_FOLDER_PATH}/screenshots`;
    cb(null, folderPath)
  },
  filename: function (req, file, cb) {
    const fullName = `${file.fieldname}-${Date.now()}.${file.mimetype.split('/')[1]}`;
    cb(null, fullName);
  }
});

const multerData = multer({
  storage
});

/**
 * Donne le nombre total de plugin
 */
router.get('/api/plugins/count', function (req, res) {
  const defaultName = '';
  const {
    query: {
      name = defaultName
    } = {}
  } = req;

  countPlugins(name)
    .then(data => res.status(200).json({
      msg: "plugins count",
      data: data
    })).catch(error => res.status(400).json({
      msg: "erreur : " + error
    }));
});


/**
 * Récupération de tous les plugins
 */
router.get('/api/plugins', function (req, res) {
  const defaultPage = 1, defaultPageSize = 10, defaultFilter = null;
  const {
    query: {
      page = defaultPage,
      pagesize = defaultPageSize,
      filterby: filter = defaultFilter
    } = {}
  } = req;

  // numéro de la page
  const pageNumber = parseInt(page, 10);
  // nombre de plugins par page
  const pageSizeNumber = parseInt(pagesize, 10);

  findPlugins(pageNumber, pageSizeNumber, filter)
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

/**
 * Récupération d'un seul plugin par son id
 */
router.get('/api/plugin/:id', function (req, res) {
  const {
    params: {
      id: pluginId
    } = {}
  } = req;

  findPluginById(pluginId)
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

/**
 * Creation d'un plugin par envoi d'un formulaire
 */
router.post('/api/plugin', multerData.single('image'), function (req, res) {
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

  createPlugin(plugin)
    .then(data => res.status(201).json({
      msg: "Ajout réussi",
      data
    }))
    .catch(error => res.status(400).json({
      msg: "erreur lors de l'insertion:" + error
    }));
});

/**
 * Modification d'un plugin
 */
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

/**
 * Suppression d'un plugin
 */
router.delete('/api/plugin/:id', function (req, res) {
  const defaultPage = 1, defaultPageSize = 10, defaultFilter = null;
  const {
    query: {
      page = defaultPage,
      pagesize = defaultPageSize,
      filterby: filter = defaultFilter
    } = {},
    params: {
      id
    }
  } = req;

  const page = parseInt(page, 10);
  const pagesize = parseInt(pagesize, 10);

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