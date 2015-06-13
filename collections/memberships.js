Memberships = new Meteor.Collection('Memberships');

Meteor.methods({
  addMember: function(membership) {
    check(membership,{
      member:  Match.idString,
      specifically: Match.idString,
      of: Match.OneOf('Groups','Sections'),
      from: Match.Optional(Date),
      to: Match.Optional(Date)
    });
    membership.from = membership.from || new Date();
    membership.to = membership.to || new Date(8630000000000000); //new Date(8640000000000000) =  Sat Sep 13 275760 01:00:00 GMT+0100 (BST) and is the maximum possible javascript Date

    var Collection = Mongo.Collection.get(membership.of);
    var item = Collection.findOne(membership.specifically);
    if (!item)
      throw new Meteor.Error('collection-not-found', "Cannot add member, not a valid collection");
    var member = Meteor.users.findOne(membership.member);
    if (!member)
      throw new Meteor.Error('user-not-found', "Cannot add member.  User not found.");

    //deactivate any past memberships before adding new membership
    var today = new Date();
    Memberships.find({member:membership.member,of:membership.of}).forEach(function(mship){
      if (mship.to > today) 
        Memberships.update(mship._id,{$set:{to:today}})
    })

    return Memberships.insert(membership);
  },
  removeMember: function(membershipID) {
    check(membershipID,Match.idString);
    var membership = Memberships.find(membershipID);
    if (!membership)
      throw new Meteor.Error('membership not found','Cannot remove member.  Membership not found.');

    //don't delete membership, rather set to field to one minute ago
    //keeps membership record, while indicating that member is no longer
    //in this group
    var today = new Date();
    return Memberships.update(membershipID,{$set: {to: today}})
  },
  changeMembershipDates: function(membershipID,from,to) {
    check(membershipID,Match.idString);
    check(from,Match.Optional(Date));
    check(to,Match.Optional(Date));
    var membership = Memberships.find(membershipID);
    if (!membership)
      throw new Meteor.Error('membership not found','Cannot remove member.  Membership not found.');
    if (Match.test(to,Date))
      Memberships.update(membershipID,{to:to});
    if (Match.test(from,Date))
      Memberships.update(membershipID,{from:from});
  }
});