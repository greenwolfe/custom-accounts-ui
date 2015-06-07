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
      //options.profile.sectionID = pEi.sectionID; //add to memberships instead
      delete pEi.sectionID;
    } else if (role == 'parentOrAdvisor') { 
      check(pEi.childrenOrAdvisees,[String]);  //childrenOrAdvisees required, but could be empty array
      options.profile.childrenOrAdvisees = [];
      pEi.childrenOrAdvisees.forEach(function(fullname,index,cOA) {
        if (!Match.test(fullname,Match.nonEmptyString)) return;
        var name = _.words(fullname);      //options.profile.sectionID = pEi.sectionID;
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
    if (role == 'student') {
      Meteor.call('addMember',{
        member: userID,
        in: section._id,
        of: 'Sections'
      });
    }
    Accounts.sendEnrollmentEmail(userID);
  },
  isEmailVerified: function(email) {
    check(email,Match.email);
    var user = Meteor.users.findOne({ 'emails.address' : email });
    if (!user)
      throw new Meteor.Error('invalidEmail','We did not find this e-mail address in our system.');
    var email = _.find(user.emails,function(e) {
      return (e.address == email);
    });
    return email.verified;
  },
  updateUser: function(user) {
    check(user,{
      _id: Match.idString,
      username: Match.Optional(String),
      emails: [Match.email],
      profile: {
        firstName: Match.Optional(Match.nonEmptyString),
        lastName: Match.Optional(Match.nonEmptyString),
        postEnrollmentInfo: { //needs different name here?
          role: Match.Optional(Match.OneOf('student','teacher','parentOrAdvisor')),
          sectionID: Match.Optional(Match.idString),
          childrenOrAdvisees: Match.Optional([String])
        }
      }
    })
    var cU = Meteor.users.findOne(user._id); //current user (whose profile is being edited)
    var editor = Meteor.user(); //currently logged in user
    if (!Roles.userIsInRole(editor,'teacher') && (editor._id != user._id))
      throw new Meteor.error('editOwnProfile',"Only a teacher can edit another user's' profile.")

    var username = user.username || null;
    if ((username) && (username != cU.username)) {
      //users.update throws error if username is already used
      //but I couldn't find a way to catch the error and send a humanized message
      //through to the client, so catching it myself here
      var usernames = _.pluck(Meteor.users.find({},{$fields: {username:1}}).fetch(),'username');
      if (_.contains(usernames,username))
        throw new Meteor.Error('usernameAlreadyExists','Username already exists.');
      Meteor.users.update(user._id,{$set: {username:username}});
    }

    var emails = user.emails || null;
    if (emails.length > 0) {
      emails = emails.map(function(email) {
        return {address:email,verified:false};
      });
      Meteor.users.update(user._id,{$addToSet:{emails: {$each:emails}}});
    }

    var firstName = user.profile.firstName || null;
    if ((firstName) && (firstName != cU.profile.firstName))
      Meteor.users.update(user._id,{$set: {'profile.firstName':firstName}});
    var lastName = user.profile.lastName || null;
    if ((lastName) && (lastName != cU.profile.lastName))
      Meteor.users.update(user._id,{$set: {'profile.lastName':lastName}});

    if (Roles.userIsInRole(editor,'teacher')) {
      if (editor._id == cU._id)
        throw new Meteor.Error("cantChangeOwnRole",'You cannot change your own role.');
      var role = user.profile.postEnrollmentInfo.role || null;
      if ((role) &&  !Roles.userIsInRole(cU,role)) {
        var currentRoles = Roles.getRolesForUser(cU);
        Roles.removeUsersFromRoles(cU,currentRoles);
        Roles.addUsersToRoles(cU,role);
      }
    }

    if (Roles.userIsInRole(cU,'student')) {
      var sectionID = user.profile.postEnrollmentInfo.sectionID || null;
      if (sectionID) {
        var currentMembership = Memberships.find(
          {member:user._id,of:'Sections'},
          {$sort:{to:-1}},
          {limit:1}
        ).fetch().pop();
        if (!currentMembership || (currentMembership.in != sectionID)) {
          Meteor.call('addMember',{
            member: user._id,
            in: sectionID,
            of: 'Sections'
          });
        }
      }
    }

    if (Roles.userIsInRole(cU,'parentOrAdvisor')) {
      user.profile.postEnrollmentInfo.childrenOrAdvisees.forEach(function(fullname,index,cOA) {
        if (!Match.test(fullname,Match.nonEmptyString)) return;
        var name = _.words(fullname);      //options.profile.sectionID = pEi.sectionID;
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
          Meteor.users.update(user._id,{$addToSet:{'profile.childrenOrAdvisees': student._id}});
        } else {
          Meteor.users.update(user._id,{$addToSet:{'profile.childrenOrAdvisees': fullname}});
        }
      });
    }


  },
  removeEmail: function(userID,email) {
    check(userID,Match.idString);
    check(email,Match.email);
    var user = Meteor.users.findOne(userID);
    if (!user)
      throw new Meteor.Error('invalid user','Cannot remove email.  Invalid user');
    var emailObject = {
      address:email,
      verified: false //don't remove verified e-mail
    }
    Meteor.users.update(userID,{$pull: {emails:emailObject}});
  },
  removeChildOrAdvisee: function(userID,studentID) {
    check(userID,Match.idString);
    check(studentID,Match.OneOf(Match.idString,Match.nonEmptyString));
    var user = Meteor.users.findOne(userID);
    if (!user)
      throw new Meteor.Error('invalid user','Cannot remove child or advisee.  Invalid user');
    Meteor.users.update(userID,{$pull: {'profile.childrenOrAdvisees':studentID}});
  }
});

