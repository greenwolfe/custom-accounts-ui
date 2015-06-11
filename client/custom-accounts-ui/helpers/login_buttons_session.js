//Must be placed in a subfolder so that it is loaded before
//the templates that use its global variables
/*var VALID_KEYS = [
  //'dropdownVisible', //deprecated?

  // XXX consider replacing these with one key that has an enum for values.
  //'inSignupFlow', //deprecated?
  //'inForgotPasswordFlow', //deprecated?
  //'inChangePasswordFlow', //deprecated?
  //'inMessageOnlyFlow', //deprecated?
  //'inEditProfileFlow', //deprecated?

  //'errorMessage', //deprecated?
  //'infoMessage', //deprecated?
  //'childrenOrAdvisees', //deprecated
  //'newEmails',  //deprecated

  // dialogs with messages (info and error)
  //'resetPasswordToken', //deprecated? (probably still used)
  //'enrollAccountToken', //deprecated? (probably still used)
//  'justVerifiedEmail',

//  'configureLoginServiceDialogVisible',
//  'configureLoginServiceDialogServiceName',
//  'configureLoginServiceDialogSaveDisabled'

];*/

var VALID_KEYS = [
  'selectedForm',
  'resetPasswordToken', 
  'enrollAccountToken', 
  'messageOnly' /*{
        type:[danger,success, info, warning, primary],
        text:'message intended for message only dialog'
      }*/
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
