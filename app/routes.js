var express = require('express');
var mongoose = require('mongoose');
var moment = require('moment');
var guard = require('./auth/guard');
var models = require('./models');


module.exports = function (connection) {

  var app = express.Router();

  var User = models.getUser(connection);
  var Event = models.getEvent(connection);
  var Kid = models.getKid(connection);

  app.get('/', function (req, res) {
    res.render('index.html');
  });


  app.get('/profile', guard.isLoggedIn, function (req, res) {
    res.render('user-form.html');
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
      //console.log(user.kids.length, i, has_data);
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
      res.render('user-form.html');
    });
  });

  app.get('/user/:id', guard.isLoggedIn, function (req, res) {
    User.findOne({_id: req.params.id}, function (err, e) {
      res.render('user-view.html', {user1: e});
    });
  });

  app.get('/events', guard.isLoggedIn, function (req, res) {
    var when = moment(req.query.d);
    Event.find({when: {$gt: when}}).populate('leader').sort('when').exec(function (err, events) {
      res.json(events);
    });
  });

  app.get('/event/create', guard.isLoggedIn, function (req, res) {
    res.render('event-form.html', {event: {when: moment(req.query.d).hour(12)}});
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

  app.get('/event/:id/remove', guard.isLoggedIn, function (req, res, next) {
    Event.remove({leader: req.user, _id: req.params.id}, function (err, e) {
      if (err || !e)
        next(new Error('not found'));
      res.redirect('/');
    });
  });

  app.post('/event/:id/update', guard.isLoggedIn, function (req, res, next) {
    Event.findOne({leader: req.user, _id: req.params.id}, function (err, e) {
      if (err || !e)
        next(new Error('not found'));
      e.when = moment(req.body.when);
      e.location = req.body.location;
      e.duration = req.body.duration;
      e.location = req.body.location;
      e.spaces = req.body.spaces;
      e.notes = req.body.notes;
      e.save(function (err, se) {
        res.render('event-form.html', {event: se});
      })
    });
  });

  app.get('/event/:id', guard.isLoggedIn, function (req, res) {
    Event.findOne({_id: req.params.id}).populate('leader').exec(function (err, e) {
      res.render('event-view.html', {event: e});
    });
  });

  app.get('/event/:id/add/:kid', guard.isLoggedIn, function (req, res) {
    Event.findOne({_id: req.params.id}).exec(function (err, e) {
      var kid = req.user.kids.id(req.params.kid);
      if (e.kids.id(kid)) {
        res.redirect('/event/' + e._id);
      } else {
        e.kids.push(kid);
        e.save(function (err, se) {
          res.redirect('/event/' + e._id);
        });
      }
    });
  });

  app.get('/event/:id/remove/:kid', guard.isLoggedIn, function (req, res) {
    Event.findOne({_id: req.params.id}).exec(function (err, e) {
      var kid = e.kids.id(req.params.kid).remove();
      e.save(function (err, se) {
        res.redirect('/event/' + e._id);
      })
    });
  });

  return app;
};
