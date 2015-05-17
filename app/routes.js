var express = require('express');
var mongoose = require('mongoose');
var moment = require('moment');
var guard = require('./auth/guard');
var models = require('./models');


module.exports = function (connection) {

  var app = express.Router();
  //var User = models.getUser(connection);
  var Event = models.getEvent(connection);

  app.get('/', function (req, res) {
    res.render('index.html');
  });

  app.get('/profile', guard.isLoggedIn, function (req, res) {
    res.render('profile.html');
  });

  app.post('/profile', guard.isLoggedIn, function (req, res) {
    var user = req.user;
    user.contact.name = req.body.name;
    user.contact.phone1 = req.body.phone1;
    user.contact.phone2 = req.body.phone2;
    for (var i = 0; i < req.body.kid.length; i += 3) {
      var name = req.body.kid[i];
      var bd = req.body.kid[i + 1];
      var notes = req.body.kid[i + 2];
      if (user.kids.length > i / 3) {
        var kid = user.kids[i / 3];
        kid.name = name;
        kid.birthday = moment(bd);
        kid.notes = notes;
      }
      else if (name && bd) {
        console.log(name, bd);
        user.kids.push({name: name, birthday: moment(bd), notes: notes});
      }
    }
    user.save(function (err, su) {
      console.log('save user', err, su);
    });

  });

  return app;
};
