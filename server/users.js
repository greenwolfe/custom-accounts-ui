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
  },
  createUnvalidatedUser: function(options) {
    check(options,{ //redundant with checks performed on client before passing options to this method
      username: Match.nonEmptyString,
      email: Match.email,
      profile: {
        firstName: Match.nonEmptyString,
        lastName: Match.nonEmptyString,
        postEnrollmentInfo: {
          role: Match.OneOf('student','teacher','parentOrAdvisor'),
          sectionID: Match.Optional(Match.idString),
          childrenOrAdvisees: Match.Optional([String])
        }
      }
    });
    var pEi = options.profile.postEnrollmentInfo;
    var role = pEi.role;
    if (role == 'student') {
      check(pEi.sectionID, Match.idString) //sectionID required to register as student
      var section = Sections.findOne(pEi.sectionID);
      if (!section) 
        throw new Meteor.Error('invalidSection','Invalid section.')
      options.profile.sectionID = pEi.sectionID;
      delete pEi.sectionID;
    } else if (role == 'parentOrAdvisor') { 
      check(pEi.childrenOrAdvisees,[String]);  //childrenOrAdvisees required, but could be empty array
      options.profile.childrenOrAdvisees = [];
      pEi.childrenOrAdvisees.forEach(function(fullname,index,cOA) {
        var name = _.words(fullname);
        var firstName,lastName;
        if (name.length == 2) {
          firstName = name[0];
          lastName = name[1]; 
        } else if (name.length > 2) {
          firstName = name[0];
          lastName = _.strRight(fullname,firstName);
          lastName = _.trim(lastName);
        }
        var student = Meteor.users.findOne({'profile.firstName':firstName,'profile.lastName':lastName});
        if (student) {
          options.profile.childrenOrAdvisees.push(student._id);
        } else {
          options.profile.childrenOrAdvisees.push(fullname);
        }
      });
    }
    delete options.profile.postEnrollmentInfo;
    var userID = Accounts.createUser(options);
    Roles.addUsersToRoles(userID,[role]);
    Accounts.sendEnrollmentEmail(userID);
  }
});

