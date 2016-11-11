'use strict';

const EngineManager = require('../managers/engines');
const engineManager = new EngineManager();
const createError = require('./utils/http-errors');
const randomstring = require('randomstring');

function createEngine(req, res, next) {
  const enginePackage = req.body;
  const channelId = randomstring.generate({
    length: 8,
    charset: 'hex'
  });
  const buildOptions = {
    enginefileName: req.query.enginefile
  };

  const createTask = engineManager.createEngine({
    channelId,
    buildOptions,
    enginePackage: enginePackage.toString('base64')
  });

  let buildMessage = '';
  createTask.on('message', (message) => {
    buildMessage += message;
  });
  createTask.on('end', () => {
    res.send(buildMessage);
    next();
  });
  createTask.on('error', (error) => {
    console.error(error);
    res.send(new createError.InternalServerError());
    next();
  });
  createTask.start();
}

module.exports = {
  createEngine
};
