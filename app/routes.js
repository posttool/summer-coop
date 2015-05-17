var express = require('express');
var guard = require('./auth/guard');

module.exports = function () {

  var app = express.Router();

  app.get('/', function (req, res) {
    res.render('index.html');
  });

   app.get('/profile', guard.isLoggedIn, function (req, res) {
    res.render('profile.html');
  });

  return app;
};
