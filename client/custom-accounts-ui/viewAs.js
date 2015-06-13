
  /***********************/
 /******* VIEW AS *******/
/***********************/

/* view as helpers */
Template.viewAs.helpers({
  selectedText: function() {
    var impersonatedUser = Meteor.impersonatedUser();
    var user = Meteor.user();
    var section = Meteor.selectedSection();
    if (!impersonatedUser) {
      if (section)
        return section.name
      if (Roles.userIsInRole(user,['teacher','parentOrAdvisor'])) 
        return 'self';
      return '';
    }
    var selectedText = impersonatedUser.profile.firstName + ' ' + impersonatedUser.profile.lastName;
    if (Roles.userIsInRole(user,'parentOrAdvisor')) 
      return selectedText;
    if (!section) 
      return selectedText;
    return selectedText + ' from ' + section.name;
  },
  sections: function() {
    return Sections.find({},{sort:{name:1}});
  }
})

  /****************************/
 /******* USER TO VIEW *******/
/****************************/

/* user to view helpers */
Template.userToView.helpers({
  active: function() {
    if (Roles.userIsInRole(Meteor.userId(),['teacher','parentOrAdvisor']))
      return ((this._id == Meteor.impersonatedOrUserId()) && !Meteor.selectedSection()) ? 'active' : '';
    return (this._id == Meteor.impersonatedId()) ? 'active' : '';

  }
})

/* user to view events */
Template.userToView.events({
  'click li a': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.set('viewAs',tmpl.data._id);
  }
})

  /*******************************/
 /******* SECTION TO VIEW *******/
/*******************************/

/* section to view helpers */
Template.sectionToView.helpers({
  active: function() {
    var section = Meteor.selectedSection();
    if (!section) return '';
    return (this._id == section._id) ? 'active' : '';
  }
})

/* section to view events */
Template.sectionToView.events({
  'click li a': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.set('viewAs',tmpl.data._id);
  }
})