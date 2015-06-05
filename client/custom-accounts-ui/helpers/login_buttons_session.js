//Must be placed in a subfolder so that it is loaded before
//the templates that use its global variables
var VALID_KEYS = [
  'dropdownVisible',

  // XXX consider replacing these with one key that has an enum for values.
  'inSignupFlow',
  'inForgotPasswordFlow',
  'inChangePasswordFlow',
  'inMessageOnlyFlow',

  'errorMessage',
  'infoMessage',
  'childrenOrAdvisees', 

  // dialogs with messages (info and error)
  'resetPasswordToken',
  'enrollAccountToken',
//  'justVerifiedEmail',

//  'configureLoginServiceDialogVisible',
//  'configureLoginServiceDialogServiceName',
//  'configureLoginServiceDialogSaveDisabled'
];

var validateKey = function (key) {
  if (!_.contains(VALID_KEYS, key)){
    throw new Meteor.Error("Invalid key in loginButtonsSession: " + key);
  }
};

var KEY_PREFIX = "Meteor.loginButtons.";

//ian created these helpers in a specific template rather than globally
VALID_KEYS.forEach(function(key) {
  Template.registerHelper(key,function() { 
    return Session.get(KEY_PREFIX + key);
  })
})

// XXX we should have a better pattern for code private to a package like this one
loginButtonsSession = {
  set: function(key, value) {
    validateKey(key);
    if (_.contains(['errorMessage', 'infoMessage'], key)){
      throw new Meteor.Error("Don't set errorMessage or infoMessage directly. Instead, use errorMessage() or infoMessage().");
    }

    this._set(key, value);
  },

  _set: function(key, value) {
    Session.set(KEY_PREFIX + key, value);
  },

  get: function(key) {
    validateKey(key);
    return Session.get(KEY_PREFIX + key);
  },

  closeDropdown: function () {
    this.set('inSignupFlow', false);
    this.set('inForgotPasswordFlow', false);
    this.set('inChangePasswordFlow', false);
    this.set('inMessageOnlyFlow', false);
    this.set('dropdownVisible', false);
    this.set('childrenOrAdvisees', false); //still used?
    this.resetMessages();
  },

  infoMessage: function(message) {
    this._set("errorMessage", null);
    this._set("infoMessage", message);
    this.ensureMessageVisible();
  },

  errorMessage: function(message) {
    this._set("errorMessage", message);
    this._set("infoMessage", null);
    this.ensureMessageVisible();
  },

  // is there a visible dialog that shows messages (info and error)
  isMessageDialogVisible: function () {
    return this.get('enrollAccountToken'); //||
      //this.get('resetPasswordToken') ||
      //this.get('justVerifiedEmail');
  },

  // ensure that somethings displaying a message (info or error) is
  // visible.  if a dialog with messages is open, do nothing;
  // otherwise open the dropdown.
  //
  // notably this doesn't matter when only displaying a single login
  // button since then we have an explicit message dialog
  // (_loginButtonsMessageDialog), and dropdownVisible is ignored in
  // this case.
  ensureMessageVisible: function () {
    if (!this.isMessageDialogVisible()){
      this.set("dropdownVisible", true);
    }
  },

  resetMessages: function () {
    this._set("errorMessage", null);
    this._set("infoMessage", null);
  }
};
