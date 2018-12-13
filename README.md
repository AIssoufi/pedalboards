# Magasin de plugins audio
Dans le cadre d'un projet [MBDS](http://www.mbds-fr.org/). Nous avons réalisé un magasin de plugins audio.

# Essayer le site en ligne

Nous mettrons d'ici dimanche 16 décembre (inclus) une version en ligne.

# Essayer le site en local

## Installation des dépendences

```bash
npm install && npm run install
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
| pedalboards-cms          	| Le CMS permettant de gérer  les pedaliers (création,  suppressiosn, édition) 	| React       	|
| pedalboards-core-service 	| L'API RESTful                                                                	|             	|
| pedalboards-frontend     	| L'application web des  pédaliers                                             	| React, Sass 	|