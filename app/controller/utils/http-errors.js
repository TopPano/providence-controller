/*!
 * http-errors
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2016 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

var statuses = require('statuses');
var inherits = require('inherits');

/**
 * Module exports.
 * @public
 */

module.exports = createError;
module.exports.HttpError = createHttpErrorConstructor();

// Populate exports for all constructors
populateConstructorExports(module.exports, statuses.codes, module.exports.HttpError);

/**
 * Create a new HTTP Error.
 *
 * @returns {Error}
 * @public
 */

function createError () {
  // so much arity going on ~_~
  var err;
  var msg;
  var status = 500;
  var props = {};
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (arg instanceof Error) {
      err = arg;
      status = err.status || err.statusCode || status;
      continue;
    }
    switch (typeof arg) {
      case 'string':
        msg = arg;
        break;
      case 'number':
        status = arg;
        break;
      case 'object':
        props = arg;
        break;
    }
  }

  if (typeof status !== 'number' || !statuses[status]) {
    status = 500;
  }

  // constructor
  var HttpError = createError[status];

  if (!err) {
    // create error
    err = HttpError ? new HttpError(msg) : new Error(msg || statuses[status]);
    if (process.env.NODE_ENV !== 'production') {
      Error.captureStackTrace(err, createError);
    }
  }

  if (!HttpError || !(err instanceof HttpError)) {
    // add properties to generic error
    err.expose = status < 500;
    err.status = err.statusCode = status;
  }

  for (var key in props) {
    if (key !== 'status' && key !== 'statusCode') {
      err[key] = props[key];
    }
  }

  return err;
}

/**
 * Create HTTP error abstract base class.
 * @private
 */

function createHttpErrorConstructor () {
  function HttpError () {
    throw new TypeError('cannot construct abstract class');
  }

  inherits(HttpError, Error);

  return HttpError;
}

/**
 * Create a constructor for a client error.
 * @private
 */

function createClientErrorConstructor (HttpError, name, code) {
  var className = name.match(/Error$/) ? name : name + 'Error';

  function ClientError (message) {
    // create the error object
    var err = new Error(message != null ? message : statuses[code]);

    // capture a stack trace to the construction point
    if (process.env.NODE_ENV !== 'production') {
      Error.captureStackTrace(err, ClientError);
    }

    // adjust the [[Prototype]]
    Object.setPrototypeOf(err, ClientError.prototype);

    // redefine the error name
    Object.defineProperty(err, 'name', {
      enumerable: false,
      configurable: true,
      value: className,
      writable: true
    });

    return err;
  }

  inherits(ClientError, HttpError);

  ClientError.prototype.status = code;
  ClientError.prototype.statusCode = code;
  ClientError.prototype.expose = true;

  return ClientError;
}

/**
 * Create a constructor for a server error.
 * @private
 */

function createServerErrorConstructor (HttpError, name, code) {
  var className = name.match(/Error$/) ? name : name + 'Error';

  function ServerError (message) {
    // create the error object
    var err = new Error(message != null ? message : statuses[code]);

    // capture a stack trace to the construction point
    if (process.env.NODE_ENV !== 'production') {
      Error.captureStackTrace(err, ServerError);
    }

    // adjust the [[Prototype]]
    Object.setPrototypeOf(err, ServerError.prototype);

    // redefine the error name
    Object.defineProperty(err, 'name', {
      enumerable: false,
      configurable: true,
      value: className,
      writable: true
    });

    return err;
  }

  inherits(ServerError, HttpError);

  ServerError.prototype.status = code;
  ServerError.prototype.statusCode = code;
  ServerError.prototype.expose = false;

  return ServerError;
}

/**
 * Populate the exports object with constructors for every error class.
 * @private
 */

function populateConstructorExports (exports, codes, HttpError) {
  codes.forEach(function forEachCode (code) {
    var CodeError;
    var name = toIdentifier(statuses[code]);

    switch (String(code).charAt(0)) {
      case '4':
        CodeError = createClientErrorConstructor(HttpError, name, code);
        break;
      case '5':
        CodeError = createServerErrorConstructor(HttpError, name, code);
        break;
    }

    if (CodeError) {
      // export the constructor
      exports[code] = CodeError;
      exports[name] = CodeError;
    }
  });
}

/**
 * Convert a string of words to a JavaScript identifier.
 * @private
 */

function toIdentifier (str) {
  return str.split(' ').map(function (token) {
    return token.slice(0, 1).toUpperCase() + token.slice(1);
  }).join('').replace(/[^ _0-9a-z]/gi, '');
}
