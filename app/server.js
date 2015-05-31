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
var nunjucks = require('nunjucks');
var nunjucks_date_filter = require('nunjucks-date-filter');

var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var config = require('./config');
var connection = mongoose.createConnection(config.db);


if (cluster.isMaster && config.cluster) {
  var later = require('later');
  var mailer = require('./mailer');

  console.log('summer coop 0.1 ' + process.env.NODE_ENV)

  var s = later.parse.text('at 4:00 pm');
  console.log('mailer service starting ' + s.error + ' ' + mailer.sendMail);
  later.setInterval(mailer.sendMail, s);

  var cpuCount = require('os').cpus().length;
  for (var i = 0; i < cpuCount; i += 1)
    cluster.fork();


} else {

  // initialize passport strategies
  var User = require('./models').getUser(connection);
  require('./auth/passport')(passport, User, config);

  var app = express();

  app.use(morgan(process.env.NODE_ENV || 'dev'));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(express.static(__dirname + '/public'));

  var nenv = nunjucks.configure(__dirname + '/views', {
    autoescape: true,
    express: app
  });
  nenv.addFilter('date', nunjucks_date_filter);
  nenv.addFilter('dump', function (o) {
    return JSON.stringify(o);
  });

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
    res.locals.user = req.user;
    next();
  });

  // add passport routes
  app.use(require('./auth/routes')(passport));

  // add site routes
  app.use(require('./routes')(connection));

  var httpServer = http.createServer(app);
  httpServer.listen(config.port);
  console.log('site listening on port ' + config.port);
  //var httpsServer = https.createServer(credentials, server);
  //httpsServer.listen(config.securePorts.site);

}

//if (config.cluster)
//  cluster.on('exit', function (worker) {
//    console.log('Worker ' + worker.id + ' died :(');
//    cluster.fork();
//  });
