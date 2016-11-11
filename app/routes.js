'use strict';

const EngineController = require('./controller/engine');

const config = require('../config');

module.exports = function configureRoutes(app) {

  function route(verb, path, handler) {
    const fullPath = `${config.apiRoot}/${config.apiVersion}${path}`;
    app[verb](fullPath, handler);
  }

  /**
   *  Engine
   */
  route('post', '/engine', EngineController.createEngine);
}
