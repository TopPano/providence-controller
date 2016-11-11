'use strict';
const CreateTask = require('./create');

/** Class Engine Manager class */
class EngineManager {
  /**
   * Create an engine instance.
   *
   * @returns {object}
   */
  createEngine(params) {
    return new CreateTask(params);
  }
}

module.exports = EngineManager;
