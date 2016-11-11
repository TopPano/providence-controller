'use strict';
const nats = require('nats');
const EventEmitter = require('events');

const IDLE = 'IDLE';

class TaskBase extends EventEmitter {
  constructor(params) {
    super();
    this._params = params;
    this._nats = {
      client: nats.connect({ json: true }),
      channels: {}
    };
    this._state = IDLE;
  }

  start() {
    this._start();
  }

  disconnect() {
    Object.keys(this._nats.channels).forEach((channel) => {
      this._nats.client.unsubscribe(channel);
    });
  }
}

module.exports = TaskBase;
