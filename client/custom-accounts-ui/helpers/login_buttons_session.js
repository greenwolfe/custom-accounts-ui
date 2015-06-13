//Must be placed in a subfolder so that it is loaded before
//the templates that use its global variables

var VALID_KEYS = [
  'selectedForm',
  'resetPasswordToken', 
  'enrollAccountToken',
  'viewAs' //either a userId or a sectionId
];

var validateKey = function (key) {
  if (!_.contains(VALID_KEYS, key))
    throw new Meteor.Error("Invalid key in loginButtonsSession: " + key);
};

var KEY_PREFIX = "Meteor.loginButtons.";

loginButtonsSession = {
  set: function(key, value) {
    validateKey(key);
    if ((key == 'viewAs') && (value == Meteor.userId()))
      value = null; //cannot impersonate self
    Session.set(KEY_PREFIX + key, value);
  },
  get: function(key) {
    validateKey(key);
    return Session.get(KEY_PREFIX + key);
  }
};

Meteor.impersonatedId = function() {
  var viewAs = loginButtonsSession.get('viewAs');
  var user = Meteor.users.findOne(viewAs);
  return (user) ? user._id: '';
                          //!user => viewAs is null or is a sectionId
}
Template.registerHelper('impersonatedId',function() {
  return Meteor.impersonatedId();
});
Meteor.impersonatedUser = function() {
  return Meteor.users.findOne(Meteor.impersonatedId());
}
Template.registerHelper('impersonatedUser',function() {
  return Meteor.impersonatedUser();
});

Meteor.impersonatedOrUserId = function() {
  return Meteor.impersonatedId() || Meteor.userId(); //could be null 
}
Template.registerHelper('impersonatedOrUserId',function() {
  return Meteor.impersonatedOrUserId();
});
Meteor.impersonatedOrUser = function() {
  return Meteor.users.findOne(Meteor.impersonatedId()) || Meteor.user();
}
Template.registerHelper('impersonatedOrUser',function() {
  return Meteor.impersonatedOrUser();
});

Meteor.selectedSection = function() {
  var viewAs = loginButtonsSession.get('viewAs');
  var section = Sections.findOne(viewAs);
  if (!section) //viewAs is null or is a userId
    return Meteor.currentSection(); //could be null if no one is logged in or logged or impersonated user has no curren section
  return section;
}
Template.registerHelper('selectedSection',function() {
  return Meteor.selectedSection();
});

Meteor.childrenOrAdvisees = function(parentOrAdvisor) {
  var user = parentOrAdvisor || Meteor.user();
  if (!Roles.userIsInRole(user,'parentOrAdvisor'))
    return null;
  var cOA = [];
  var students = user.childrenOrAdvisees || '';
  if (students) {
    students.forEach(function(s,index,students) {
      var student = Meteor.users.findOne(s.idOrFullname);
      if (student && s.verified) 
        cOA.push(student);
    });
  }
  return cOA;
}
Template.registerHelper('childrenOrAdvisees',function() {
  return Meteor.childrenOrAdvisees();
});