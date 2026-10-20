# Description
Conception et réalisation d'un magasin de plugin audio (pédale d’effet virtuel).

## Environnement Technique
- Langage : HTML 5, CSS 3, JavaScript (ES6 et 7)
- OS : macOS
- Library : ReactJS, ReduxJS, Recompose, Sass, Express, mongodb, lodash
- Base de données:  MongoDB
- Outil : Docker, Postman, Git, SourceTree, GitLab, Visual Studio Code


# Essayer le site en ligne

[Front End](https://pedalboards-frontend.herokuapp.com)

[Back End](https://pedalboards-cms.herokuapp.com)

[API Server](https://pedalboards-core-service.herokuapp.com)

# Essayer le site en local

## Installation des dépendences

```bash
npm install
```

Ce script va installer toutes les dépendances NPM des micro-services suivant :
* Pedalbords CMS
* Pedalbords Core Service
* Pedalboards Frontend

## Lancer le projet

```bash
npm run start:dev
```

Ce script va lancer l'application web et tous les services nécessaire a son fonctionnement. 
Les services lancé sont :
* mongoDB
* core-service
* fontend
* cms

## MongoDB (sur MAC)

### Installation de mongoDB

```bash
cd pedalboards-core-service 
npm run mongo:install
```

Ce script va installer le serveur mongodb sur votre machine.

### Import de la BD
```bash
cd pedalboards-core-service
npm run mongo:import
```

Ce script va importer la base de données sur mongoDB.
Après l'importation vous aurez:
 - une base de données appelé `mbds`
 - une collection appelée `pedalboards`

## Architecture

| Dossier                  	| Description                                                                  	| Technos     	|
|--------------------------	|------------------------------------------------------------------------------	|-------------	|
| pedalboards-cms          	| Le CMS permettant de gérer  les pedaliers (création,  suppressiosn, édition) 	| ReactJS, Sass    |
| pedalboards-core-service 	| L'API RESTful                                                                	| Express, MongoDB    	|
| pedalboards-frontend     	| L'application web des  pédaliers                                             	| React, Sass, Redux, Recompose	|

## Node.js 24

- The three apps install, test and build on Node.js 24, the current LTS.
- The frontend and the CMS compile their styles with Dart Sass, installed under the `node-sass` name
  (`"node-sass": "npm:sass@…"`): `sass-loader` 7 of Create React App 2 only loads a module called
  `node-sass`, and `node-sass` itself has no build for Node.js 24. The alias goes away when an app
  leaves Create React App ([#33](https://github.com/AIssoufi/pedalboards/issues/33) for the
  frontend).
- Their `start` and `build` scripts set `NODE_OPTIONS=--openssl-legacy-provider`: webpack 4 hashes
  modules with MD4, which OpenSSL 3 disables. The flag also goes away when an app leaves Create
  React App.
