'use strict';

var randomstring = require("randomstring");

class JobManager {
  constructor() {
    this.jobs = {};
  }

  createJob() {
    const jobId = randomstring.generate({
      length: 8,
      charset: hex
    });
    this.jobs[jobId] = { id: jobId };
    return this.jobs[jobId];
  }

  getJobById(id) {
    return this.jobs[id];
  }

  deleteJobById(id) {
    delete this.jobs[id];
  }
}

module.exports.JobManager;
