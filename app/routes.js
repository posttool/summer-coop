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
    if (req.user) {
      Event.find({when: {$gt: new Date()}}).populate('leader').sort('when').exec(function (err, events) {
        res.render('index.html', {events: events});
      });
    } else
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
    for (var i = 0; i < req.body.kid.length / 3; i++) {
      var name = req.body.kid[i * 3];
      var bd = req.body.kid[i * 3 + 1];
      var notes = req.body.kid[i * 3 + 2];
      var has_data = name != '' && bd != '';
      console.log(user.kids.length, i, has_data);
      if (user.kids.length > i) {
        var kid = user.kids[i];
        kid.name = name;
        kid.birthday = bd ? moment(bd) : null;
        kid.notes = notes;
      }
      else if (has_data) {
        user.kids.push({name: name, birthday: bd ? moment(bd) : null, notes: notes});
      }
    }
    user.save(function (err, su) {
      console.log('save user', err, su);
//      res.json({err: err, user: su});
      res.render('profile.html');
    });
  });

  app.get('/event/create', guard.isLoggedIn, function (req, res) {
    res.render('event-form.html', {event: {}});
  });

  app.post('/event/create', guard.isLoggedIn, function (req, res) {
    var event = new Event({
      leader: req.user,
      when: moment(req.body.when),
      location: req.body.location,
      duration: req.body.duration,
      location: req.body.location,
      spaces: req.body.spaces,
      notes: req.body.notes
    });
    event.save(function () {
      res.redirect('/event/' + event._id);
    });
  });

  app.get('/event/:id/update', guard.isLoggedIn, function (req, res) {
    Event.findOne({_id: req.params.id}, function (err, e) {
      res.render('event-form.html', {event: e});
    });
  });

  app.get('/event/:id', guard.isLoggedIn, function (req, res) {
    Event.findOne({_id: req.params.id}).populate('leader').exec(function (err, e) {
      res.render('event-view.html', {event: e});
    });
  });

  return app;
};
