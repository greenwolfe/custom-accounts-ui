//Must be placed in a subfolder so that it is loaded before
//the templates that use its global variables

var VALID_KEYS = [
  'selectedForm',
  'resetPasswordToken', 
  'enrollAccountToken'
];

var validateKey = function (key) {
  if (!_.contains(VALID_KEYS, key))
    throw new Meteor.Error("Invalid key in loginButtonsSession: " + key);
};

var KEY_PREFIX = "Meteor.loginButtons.";

loginButtonsSession = {
  set: function(key, value) {
    validateKey(key);
    Session.set(KEY_PREFIX + key, value);
  },
  get: function(key) {
    validateKey(key);
    return Session.get(KEY_PREFIX + key);
  }
};
