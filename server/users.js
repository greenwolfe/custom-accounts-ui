Meteor.methods({
/* Assign role to new user */
  assignRole: function(userID,role) {
    check(userID, Match.idString)
    check(role, Match.OneOf('teacher','student','parentOrAdvisor'))
    var user = Meteor.users.findOne(userID);
    if (!user)
      throw new Meteor.Error('invalid user','Cannot change role.  Invalid user.');

    var cU = Meteor.userId();
    if (Roles.userIsInRole(cU,'teacher')) {
      Roles.addUsersToRoles(userID,role); //teacher can change someone's role at any time
      return userID;
    } 
    if ( !(cU && (userID == cU)) ) {
      throw new Meteor.Error('selfEnroll','Only a teacher can assign a role to anothe user.');
    };
    if (role == 'teacher')
      throw new Meteor.Error('cantAssignTeacher','Only a teacher can assign a teacher role to another user.');
    var usersRoles = Roles.getRolesForUser(userID);
    if (usersRoles.length > 0)
      throw new Meteor.Error('cantChangeOwnRole','Only a teacher can assign you a new role.');
    //so this would likely only be called right after a new user is created and is
    //being assigned their first role
    Roles.addUsersToRoles(userID,role);
    return userID;
  }
});