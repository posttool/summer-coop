var express = require('express');
var mongoose = require('mongoose');
var guard = require('./auth/guard');
var models = require('./models');


module.exports = function (connection) {

  var app = express.Router();
  var User = models.getUser(connection);
  var Event = models.getEvent(connection);

  app.get('/', function (req, res) {
    res.render('index.html');
  });

  app.get('/profile', guard.isLoggedIn, function (req, res) {
    res.render('profile.html');
  });

  return app;
};
