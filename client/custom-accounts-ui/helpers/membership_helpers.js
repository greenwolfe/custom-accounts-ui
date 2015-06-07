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

var currentMembershipFactory = function(of) {
  return function() {
    var today = new Date();
    var member = Meteor.userId(); //or ViewAs
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
    return collection.findOne(membership.in);
  }
}

currentGroup = currentMembershipFactory('Groups');
Template.registerHelper('currentGroup',currentGroup);
currentSection = currentMembershipFactory('Sections');
Template.registerHelper('currentSection',currentSection);
