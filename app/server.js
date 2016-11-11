const restify = require('restify');
const bodyParser = require('body-parser');
const multer = require('multer');
const config = require('../config');
const configureRoutes = require('./routes');

const app = module.exports = restify.createServer();

app.start = function() {
  return app.listen(config.port, function() {
    app.emit('started');
    console.log('Controller listening at: %s', config.port);
  });
};

app.use(restify.queryParser());
app.use(bodyParser.json());
app.use(bodyParser.raw({
  type: 'application/tar',
  inflate: false
}));
app.use(bodyParser.urlencoded({ extended: true }));
configureRoutes(app);

// start the server if `$ node app.js`
if (require.main === module) {
  app.start();
}
