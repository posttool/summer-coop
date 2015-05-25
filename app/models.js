// load the things we need
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var bcrypt = require('bcrypt-nodejs');


// KIDS

var kidSchema = mongoose.Schema({
  name: String,
  birthday: Date,
  notes: String
});

exports.getKid = function (conn) {
  return conn.model('Kid', kidSchema)
};


// USER
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
    name: String,
    phone1: String,
    phone2: String
  },
  kids: [kidSchema]
});

userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};

exports.getUser = function (conn) {
  return conn.model('User', userSchema)
};





// EVENT
var eventSchema = mongoose.Schema({
  when: Date,
  duration: Number,
  location: String,
  spaces: Number,
  leader: {type: ObjectId, ref: 'User'},
  backup: {type: ObjectId, ref: 'User'},
  notes: String,
  kids: [kidSchema]
});

exports.getEvent = function (conn) {
  return conn.model('Event', eventSchema)
};



// MESSAGE
var messageSchema = mongoose.Schema({
  when: Date,
  event: {type: ObjectId, ref: 'Event'},
  from: {type: ObjectId, ref: 'User'},
  text: String,
  sent: Boolean
});

exports.getMessage = function (conn) {
  return conn.model('Message', messageSchema)
};