
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
    var selectedText = "<span title='" + impersonatedUser.profile.firstName + ' ' + impersonatedUser.profile.lastName + "'>" + impersonatedUser.profile.firstName + "</span>";
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
    if ((this._id == Meteor.userId()) && !Meteor.selectedSection())
      return  'active';
    return (this._id == Meteor.impersonatedId()) ? 'active' : '';
  }
})

/* user to view events */
Template.userToView.events({
  'click li a': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.set('viewAs',tmpl.data._id);
    loginButtonsSession.set('sectionID',null); //resetting group menu
    loginButtonsSession.set('invitees',null);
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