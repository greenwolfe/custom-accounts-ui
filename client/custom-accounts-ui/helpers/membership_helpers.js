currentMembershipFor = function(member,of) {
  var today = new Date();
  var membership = Memberships.find(
    {member:member,of:of},
    {$sort:{to:-1}},
    {limit:1}
  ).fetch().pop();
  if (!membership)
    return null; //no current membership
  if ((today < membership.from) || (today > membership.to)) 
    return null; //no current membership, probably indicates a problem
  var collection = Mongo.Collection.get(membership.of);  
  return collection.findOne(membership.in);
}

//current group or section (or ...) for impersonatedUser (or by default currently logged in user)
var currentMembershipFactory = function(of) {
  return function(member) {
    var today = new Date();
    var member = member || Meteor.impersonatedId(); //or Meteor.userId() is implied if no impersonation
    var membership = Memberships.find(
      {member:member,of:of},
      {$sort:{to:-1}},
      {limit:1}
    ).fetch().pop();
    if (!membership)
      return null; //no current membership
    if ((today < membership.from) || (today > membership.to)) 
      return null; //latest membership not current, probably indicates a problem
    var collection = Mongo.Collection.get(membership.of);  
    return collection.findOne(membership.specifically);
  }
}

Meteor.currentGroup = currentMembershipFactory('Groups');
Template.registerHelper('currentGroup',Meteor.currentGroup);
Meteor.currentSection = currentMembershipFactory('Sections');
Template.registerHelper('currentSection',Meteor.currentSection);

Template.registerHelper('userIsInRole',function(user,role) {
  return Roles.userIsInRole(user,role);
});

var currentMembersFactory = function(of,idsOnly) {
  return function(specifically) {
    if (specifically) {
      var id = specifically._id || specifically;
    } else {
      var specifically = currentMembershipFactory(of)(); //defaults to current group, section, etc if any
      if (!specifically)
        return null;
      var id = specifically._id || specifically;
    }
    var today = new Date();
    var memberships = Memberships.find({
        of:of,
        specifically:id,
        from: {$lt: today},
        to: {$gt: today}
      },
      {fields:{member:1}}).fetch();

    var memberIds = _.pluck(memberships,'member');
    if (idsOnly) return memberIds;
    return Meteor.users.find({_id: {$in: memberIds}});
  }
}

Meteor.groupMembers = currentMembersFactory('Groups',false);
Meteor.sectionMembers = currentMembersFactory('Sections',false);  
Meteor.groupMemberIds = currentMembersFactory('Groups',true); 
Meteor.sectionMemberIds = currentMembersFactory('Sections',true);

Template.registerHelper('groupMembers',Meteor.groupMembers);
Template.registerHelper('sectionMembers',Meteor.sectionMembers);