Meteor.publish('sections',function() {
  return Sections.find();
});
Meteor.publish('userList',function() {
  if (this.userId) 
    return Meteor.users.find({},{fields : {username : 1, roles: 1, profile: 1}});
  this.ready(); //returns blank collection
});
Meteor.publish('emails',function(){
  if (this.userId && Roles.userIsInRole(this.userId,'teacher')) {
    return Meteor.users.find({},{fields: {emails: 1}});
  this.ready();
  }
})
Meteor.publish('memberships',function() {
  if (this.userId) {
    return Memberships.find();
  } else {
    this.ready(); //returns blank collection
  }
})