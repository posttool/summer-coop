var mongoose = require('mongoose');
var moment = require('moment');
var async = require('async');
var Mailgun = require('mailgun').Mailgun;

var guard = require('./auth/guard');
var models = require('./models');
var config = require('./config');
var mg = new Mailgun(config.mailgun);
var connection = mongoose.createConnection(config.db);

var User = models.getUser(connection);
var Event = models.getEvent(connection);
var Kid = models.getKid(connection);
var Message = models.getMessage(connection);


/**
 * for all 'new' event
 * send mail to all users who want to receive mail
 * @param complete
 */
function send_new_events(complete) {
  User.find({sendMail: true}).exec(function (err, users) {
    if (err) return complete(err);
    Event.find({sent: false}).sort('when').populate('leader').exec(function (err, events) {
      if (err) return complete(err);
      async.each(events, function (event, next) {
        var text = 'A new event has been created: \n\n' + get_event_details(event);
        get_messages(event, function (err, msg) {
          if (msg)
              text += '\nMessages: \n\n' + msg;
          send_mail(get_recipients(users), 'New event!', text, function (err) {
            if (err) return next(err);
            event.sent = true;
            event.save(function (err, e) {
              if (err) return next(err);
              else next();
            })
          });
        });
      }, complete);
    });
  });
}

/**
 * for each event with  'new' messages
 * send mail to all who are part of event
 * @param complete
 */
function send_new_messages(complete) {
  Message.find({sent: false}).exec(function (err, messages) {
    var events = [];
    messages.forEach(function (m) {
      var eid = m.event.toString();
      if (events.indexOf(eid) == -1)
        events.push(eid);
    });
    Event.find({_id: {$in: events}}).populate('kids leader').exec(function (err, events) {
      if (err) return complete(err);
      async.each(events, function (event, next) {
        User.find({kids: {$in: event.kids}}).exec(function (err, users) {
          if (err) return complete(err);
          var text = 'New messages: \n\n' + get_event_details(event);
          get_messages(event, function (err, msg) {
            if (msg)
              text += '\nMessages: \n\n' + msg;
            send_mail(get_recipients(users), 'New messages!', text, function (err) {
              if (err) return next(err);
              event.sent = true;
              event.save(function (err, e) {
                if (err) return next(err);
                else next();
              })
            });
          });
        });
      }, complete);
    });
  });
}

function send_mail(recipients, title, text, next) {
  console.log('mail', title, recipients);
  console.log('    ', text);
  mg.sendText(config.sender, recipients, '[summer-coop] ' + title, text,
    function (err) {
      if (err) console.log('Oh noes: ' + err);
      else     console.log('Success');
      next(err);
    });
}

function get_recipients(users) {
  var recipients = [];
  users.forEach(function (u) {
    recipients.push(u.contact.name + ' <' + u.contact.email + '>');
  });
  return recipients;
}

function get_event_details(event) {
  return 'Host: ' + event.leader.contact.name + '\n' +
    'When: ' + moment(event.when).format('MMM DD h:mma') + '\n' +
    'Where: ' + event.location + '\n' +
    'Notes: ' + event.notes + '\n' +
    'Web page: ' + config.url + '/event/' + event._id + '\n';
}

function get_messages(event, complete) {
  var msg = '';
  var msgs_to_save = [];
  Message.find({event: event}).sort('when').populate('from').exec(function (err, messages) {
    if (err) return complete(err);
    messages.forEach(function (m, i) {
      if (!m.sent)
        msgs_to_save.push(m._id);
      if (i != 0)
        msg += m.from.contact.name + ' ' + m.text + '\n';
    });
    if (msgs_to_save)
      Message.update({_id: {$in: msgs_to_save}}, {$set: {sent: true}}, {multi: true}, function (err) {
        if (err) return complete(err);
        else complete(null, msg);
      })
    else
      complete(null, msg);
  });

}

exports.sendMail = function (complete) {
  send_new_events(send_new_messages(complete));
}

if (!module.parent) {
  exports.sendMail(function (err) {
    console.log('mail', err ? err : 'complete');
    process.exit(0);
  })
}