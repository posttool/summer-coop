var express = require('express');
var mongoose = require('mongoose');
var moment = require('moment');
var async = require('async');
var Mailgun = require('mailgun').Mailgun;

var guard = require('./auth/guard');
var models = require('./models');
var mg = new Mailgun('key-1c328de125b80d29c470367f397840b1');

module.exports = function (connection) {

  var app = express.Router();

  var User = models.getUser(connection);
  var Event = models.getEvent(connection);
  var Kid = models.getKid(connection);
  var Message = models.getMessage(connection);


// for all "new" event
//   send mail to all users who want to receive mail

// for each event
//    for each "new" message
//        send mail to all who are part of event

  function doit(next) {
    User.find({sendMail: true}).exec(function (err, users) {
      if (err) return next(err);
      Event.find({sent: false}).order('when').exec(function (err, events) {
        if (err) return next(err);
        async.each(events, function (event, next) {
          async.each(users, function (user, next) {
            var text = "A new event has been created: \n" + JSON.stringify(event);
            sendMail(user.contact.email, "New summer coop event!", text, next);
          }, next);
        });
      });
    });
  }

  function sendMail(email, title, text, next) {
    mg.sendText(email, [],//'Recipient 1 <rec1@example.com>', 'rec2@example.com'
      "[summer-coop] " + title,
      text,
      'noreply@pagesociety.net', {},
      function (err) {
        if (err) console.log('Oh noes: ' + err);
        else     console.log('Success');
        next(err);
      });
  }

}