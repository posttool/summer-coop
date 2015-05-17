/* welcome */

var fs = require('fs');
var http = require('http');
//var https = require('https');
//var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
//var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};

var cluster = require('cluster');
var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var moment = require('moment');
var config = require('./config');

var nunjucks = require('nunjucks');


if (cluster.isMaster && config.cluster) {
  var cpuCount = require('os').cpus().length;
  for (var i = 0; i < cpuCount; i += 1)
    cluster.fork();
} else {

  // initialize passport strategies
  require('./auth/passport')(passport, require('./auth/user'), config);

  var app = express();

  app.use(morgan(process.env.NODE_ENV || 'dev'));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  nunjucks.configure(__dirname + '/views', {
    autoescape: true,
    express: app
  });
  app.use(express.static(__dirname + '/public'));

  app.use(session({
    secret: 'huifdsuihfdsjoafnlk',
    store: new MongoStore({
      db: 'summer-coop-session-db'
    }),
    resave: true,
    saveUninitialized: true
  }));

  // initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // flash for message & user in req locals
  app.use(flash());
  app.use(function (req, res, next) {
    console.log(req.user)
    res.locals.user = req.user;
    res.locals.moment = moment;
    next();
  });

  // add passport routes
  app.use(require('./auth/routes.js')(passport));

  // add site routes
  app.use(require('./routes.js')());

  var httpServer = http.createServer(app);
  httpServer.listen(config.ports.site);
  console.log('site listening on port ' + config.ports.site);
  //var httpsServer = https.createServer(credentials, server);
  //httpsServer.listen(config.securePorts.site);


}

if (config.cluster)
  cluster.on('exit', function (worker) {
    console.log('Worker ' + worker.id + ' died :(');
    cluster.fork();
  });
