'use strict';
const merge = require('lodash/merge');
const base = require('./base');

const config = merge({}, base, {
  port: process.env.PORT || 8000
});

module.exports = config;

