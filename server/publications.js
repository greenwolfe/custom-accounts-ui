Meteor.publish('sections',function() {
  return Sections.find();
});
Meteor.publish('userList',function() {
  if (this.userId) {
    return Meteor.users.find({},{fields : {username : 1, roles: 1, profile: 1}});
  } else {
    this.ready(); //returns blank collection
  };
});
Meteor.publish('memberships',function() {
  if (this.userId) {
    return Memberships.find();
  } else {
    this.ready(); //returns blank collection
  }
})