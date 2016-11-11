'use strict';
const TaskBase = require('../taskBase');
const assert = require('assert');

const IDLE        = 'IDLE';
const PROCESSING  = 'PROCESSING';
const COMPLETED   = 'COMPLETED';
const ABORTED     = 'ABORTED';

/** Class Engine Manager class */
class CreateTask extends TaskBase {
  /**
   * Constructor
   * @param {object} params - the parameters of the request for Engine Manager
   */
  constructor(params) {
    super(params);
  }

  /**
   * Create an engine instance.
   *
   * @returns {object}
   */
  _start() {
    if (this._state === PROCESSING || this._state === COMPLETED) {
      return;
    }
    else if (this._state === IDLE) {
      this._state = PROCESSING;
    }

    const channelId = this._params.channelId;
    const buildOptions = this._params.buildOptions;
    const enginePackage = this._params.enginePackage;
    if (!channelId) {
      return this.emit('error', new Error('Bad Requset: task channel id not found'));
    }
    if (!enginePackage) {
      return this.emit('error', new Error('Bad Requset: engine package not found'));
    }

    this._nats.channels.control = this._nats.client.subscribe(`engine.${channelId}.build.control`,
                                                              this._controlHandler.bind(this));
    this._nats.channels.message = this._nats.client.subscribe(`engine.${channelId}.build.message`,
                                                              this._messageHandler.bind(this));
    console.log('enginePackage: '+enginePackage.toString());
    const request = {
      type: 'BUILD',
      channelId,
      payload: {
        buildOptions,
        enginePackage: enginePackage.toString()
      }
    };
    console.log('request: '+request.type);
    this._nats.client.publish('controller.engine', request);
    console.log('started');
  }

  _messageHandler(message) {
    /**
     * Message event.
     *
     * @event Create#message
     * @type {string}
     */
    this.emit('message', message.data);
  }

  _controlHandler(command) {
    assert(typeof command === 'object');
    assert(command.type);
    switch (command.type) {
      case 'END':
        /**
         * END event.
         *
         * @event Create#end
         */
        this.emit('end');
        this._state = COMPLETED;
        this.disconnect();
        break;
      case 'ERROR':
        /**
         * ERROR event.
         *
         * @event Create#error
         * @type {object}
         */
        this.emit('error', command.payload);
        this._state = ABORTED;
        this.disconnect();
        break;
      default:
        break;
    }
  }
}

module.exports = CreateTask;

