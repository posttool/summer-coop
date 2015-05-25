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
  var Message = models.getMessage(connection);

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
    var when = moment(req.query.d).subtract(7, 'day');
    var when_end = moment(when).add(35, 'day');
    Event.find({when: {$gt: when, $lt: when_end}}).populate('leader').sort('when').exec(function (err, events) {
      res.json(events);
    });
  });

  app.get('/event/create', guard.isLoggedIn, function (req, res) {
    res.render('event-form.html', {event: {when: moment(req.query.d).hour(12)}});
  });

  app.post('/event/create', guard.isLoggedIn, function (req, res) {
    new Event({
      leader: req.user,
      when: moment(req.body.when),
      location: req.body.location,
      duration: req.body.duration,
      location: req.body.location,
      spaces: req.body.spaces,
      notes: req.body.notes
    }).save(function (err, event) {
        create_message(event, req.user, 'Created a new event.', function (err, m) {
          res.redirect('/event/' + event._id);
        });
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
        create_message(e, req.user, 'Updated the event info.', function (err, m) {
          res.render('event-form.html', {event: se});
        });
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
          create_message(e, req.user, 'Added ' + kid.name + ' to the event.', function (err, m) {
            res.redirect('/event/' + e._id);
          });
        });
      }
    });
  });

  app.get('/event/:id/remove/:kid', guard.isLoggedIn, function (req, res, next) {
    Event.findOne({_id: req.params.id}).exec(function (err, e) {
      if (err) return next(err);
      var kid = e.kids.id(req.params.kid).remove();
      e.save(function (err, se) {
        if (err) return next(err);
        create_message(e, req.user, 'Removed ' + kid.name + ' from the event.', function (err, m) {
          res.redirect('/event/' + e._id);
        });
      })
    });
  });

  app.get('/event/:id/messages', guard.isLoggedIn, function (req, res, next) {
    Event.findOne({_id: req.params.id}).exec(function (err, e) {
      if (err || !e)
        throw new Error('requires event');
      Message.find({event: e}).populate('from').exec(function (err, messages) {
        if (err) return next(err);
        res.json(messages);
      })
    });
  });

  app.post('/event/:id/message', guard.isLoggedIn, function (req, res, next) {
    Event.findOne({_id: req.params.id}).exec(function (err, e) {
      if (err || !e)
        throw new Error('requires event');
      create_message(e, req.user, req.body.text, function (err, m) {
        res.json({error: err, message: m})
      });
    });
  });

  function create_message(event, user, text, complete) {
    new Message({
      when: new Date(),
      event: event,
      from: user,
      text: text,
      sent: false
    }).save(function (err, m) {
        complete(err, m)
      });
  }

  return app;
};
