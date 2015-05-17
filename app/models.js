// load the things we need
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

  local: {
    email: String,
    password: String,
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  twitter: {
    id: String,
    token: String,
    displayName: String,
    username: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  contact: {
    email: String,
    name: String
  }

});

// generating a hash
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.identifier = function () {
  if (this.local.email)
    return this.local.email;
  else if (this.facebook.name)
    return this.facebook.name;
  else if (this.twitter.username)
    return this.twitter.username;
  else if (this.google.name)
    return this.google.name;
};

// create the model for users and expose it to our app
exports.getUser = function(conn) { return conn.model('User', userSchema) };


var eventSchema = mongoose.Schema({
  when: Date,
  duration: Number,
  location: String,
  leader: {type: ObjectId, ref: 'User'},
  backup: {type: ObjectId, ref: 'User'},
  notes: String,

});

exports.getEvent = function(conn) { return conn.model('Event', eventSchema) };
