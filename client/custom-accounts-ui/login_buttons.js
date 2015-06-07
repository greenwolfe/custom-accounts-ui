  /**********************************/
 /******* LOGIN BUTTONS ************/
/**********************************/

// events shared between loginButtonsLoggedOutDropdown and
// loginButtonsLoggedInDropdown

Template.loginButtons.events({
  'click input': function(event) {
    event.stopPropagation();
  },
  'click #login-name-link, click #login-sign-in-link': function(event) {
    event.stopPropagation();
    loginButtonsSession.set('dropdownVisible', true);
    Meteor.flush();
  },
  'click .login-close': function() {
    loginButtonsSession.closeDropdown();
  },
  'click .dropdown-toggle': function(event) {
    event.stopPropagation();
    Template.loginButtons.toggleDropdown();
  },
  'click select': function(event,tmpl) {
    event.stopPropagation();
  }  
});

//is this used?
Template.loginButtons.toggleDropdown = function() {
  toggleDropdown();
  focusInput();
};

  /**********************************/
 /******* LOG OUT DROPDOWN *********/
/**********************************/

Template.logOutDropdown.events({
  'click #login-buttons-logout': function(event,tmpl) {
    Meteor.logout(function(error) {
      loginButtonsSession.closeDropdown();
    });
  },
  'click #login-buttons-open-change-password': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.set('inChangePasswordFlow',true);
  },
  'click #login-buttons-logout-message-only-OK': function(event,tmpl) {
    loginButtonsSession.closeDropdown();
  },
  'click #login-buttons-edit-profile': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.set('inEditProfileFlow',true);
  }
})

  /*********************************/
 /******* LOG IN DROPDOWN *********/
/*********************************/

Template.logInDropdown.events({
  'click #login-buttons-message-only-OK': function(event,tmpl) {
    loginButtonsSession.closeDropdown();
  }
});



  /**********************************/
 /******* LOGIN FORM ***************/
/**********************************/

Template.loginForm.events({
  'click #login-buttons-signin': function(event,tmpl) {
    event.stopPropagation();
    login(event,tmpl);
  },
  'keypress #login-username-or-email, keypress #login-password': function(event,tmpl) {
    if (event.keyCode === 13){
      login(event,tmpl);
    }
  },
  'click #signup-link': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();

    // store values of fields before swtiching to the signup form
    var usernameOrEmail = getTrimmedVal(tmpl,'login-username-or-email');
    // notably not trimmed. a password could (?) start or end with a space
//    var password = getVal(tmpl,'login-password');

    loginButtonsSession.set('inSignupFlow', true);
    loginButtonsSession.set('inForgotPasswordFlow', false);

    // force the ui to update so that we have the approprate fields to fill in
    Meteor.flush();

    // update new fields with appropriate defaults
    if (usernameOrEmail){
      if (Match.test(usernameOrEmail,Match.email)) {
        $('#login-create-email').val(usernameOrEmail);
      } else {
        $('#login-create-username').val(usernameOrEmail);
      }
    }
//    if (password)
//      $('#login-create-password').val(password);
  },
  'click #forgot-password-link': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();
    infoMessage('Enter your e-mail address, and a message will be sent to you with a link allowing you to change your password.');

    var usernameOrEmail = getTrimmedVal(tmpl,'login-username-or-email');

    loginButtonsSession.set('inSignupFlow', false);
    loginButtonsSession.set('inForgotPasswordFlow', true);
    
    Meteor.flush();

    if ((usernameOrEmail) && Match.test(usernameOrEmail,Match.email))
        $('#forgot-password-email').val(usernameOrEmail);
  }
});

  /**********************************/
 /******* CREATE ACCOUNT FORM ******/
/**********************************/

Template.createAccountForm.helpers({
  sections: function() {
    return Sections.find();
  },
  students: function() {
    var childrenOrAdvisees = loginButtonsSession.get('childrenOrAdvisees');
    if (!childrenOrAdvisees) return '';
    return childrenOrAdvisees.map(function(student) {
      return {name:student};
    });
  }
})

Template.createAccountForm.events({
  'change #login-create-role' : function(event,tmpl) {
    if ($(tmpl.find('#login-create-role')).val() == 'student') {
      $(tmpl.find('#login-create-section')).removeClass('hidden');
    } else {
      $(tmpl.find('#login-create-section')).addClass('hidden');
    }
    if ($(tmpl.find('#login-create-role')).val() == 'parentOrAdvisor') {
      $(tmpl.find('#login-create-choose-students')).removeClass('hidden');
    } else {
      $(tmpl.find('#login-create-choose-students')).addClass('hidden');
    }
  },
  'keypress .login-create-choose-student': function(event,tmpl) {
    if (event.keyCode === 13){
      var childrenOrAdvisees = [];
      tmpl.$('.login-create-choose-student').each(function(i,s) {
        var cleanValue = _.clean(s.value);
        if (cleanValue) {
          childrenOrAdvisees.push(cleanValue);
        }
      })
      loginButtonsSession.set('childrenOrAdvisees',childrenOrAdvisees);
      $(event.target).val('');
    }
  },
  'click #login-buttons-cancel-create': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();

    var username = getTrimmedVal(tmpl,'login-create-username');
    var email = getTrimmedVal(tmpl,'login-create-email');
//    var password = getVal(tmpl,'login-create-password');

    loginButtonsSession.set('inSignupFlow', false);
    loginButtonsSession.set('inForgotPasswordFlow', false);

    // force the ui to update so that we have the approprate fields to fill in
    Meteor.flush();

    // update new fields with appropriate defaults
    if (username) {
      $('#login-username-or-email').val(username);
    } else if (email) {
      $('#login-username-or-email').val(email);
    }
//    if (password) 
//      $('#login-password').val(password);
  },
  'click #login-buttons-create': function(event,tmpl) {
    event.stopPropagation();
    createUser(event,tmpl);
  },
  "keypress .form-control[type!='role'][type!='section'][type!='student']": function(event,tmpl) {
    event.stopPropagation();
    if (event.keyCode === 13) {
      createUser(event,tmpl);
    } 
  }
});

  /**********************************/
 /******* FORGOT PASSWORD FORM******/
/**********************************/

Template.forgotPasswordForm.events({
  'click #login-buttons-cancel-forgot-password': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();

    var email = getTrimmedVal(tmpl,'forgot-password-email');

    loginButtonsSession.set('inSignupFlow', false);
    loginButtonsSession.set('inForgotPasswordFlow', false);

    // force the ui to update so that we have the approprate fields to fill in
    Meteor.flush();

    // update new fields with appropriate defaults
    if (email) 
      $('#login-username-or-email').val(email);  
  },
  'keypress #forgot-password-email': function(event,tmpl) {
    event.stopPropagation();
    if (event.keyCode === 13){
      forgotPassword(event,tmpl);
    }
  },
  'click #login-buttons-forgot-password': function(event,tmpl) {
    event.stopPropagation();
    forgotPassword(event,tmpl);
  }
})

  /**********************************/
 /******* CHANGE PASSWORD FORM******/
/**********************************/

Template.changePasswordForm.events({
  'keypress #change-password-old, keypress #change-password-new, keypress #change-password-new-again': function(event,tmpl) {
    event.stopPropagation();
    if (event.keyCode === 13){
      changePassword(event,tmpl);
    }    
  },
  'click #login-buttons-do-change-password': function(event,tmpl) {
    event.stopPropagation();
    changePassword(event,tmpl);
  },
  'click #login-buttons-cancel-change-password': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();
    loginButtonsSession.set('inChangePasswordFlow',false);    
  }
});

  /********************************/
 /******* EDIT PROFILE FORM ******/
/********************************/

Template.editProfileForm.helpers({
  sections: function() {
    return Sections.find();
  },
  sectionSelected: function () {
    var cS = currentSection();
    return ((cS) && (this._id == cS._id)) ? 'selected' : '';
  },
  noSectionSelected: function() {
    return (currentSection()) ? '' : 'selected';
  },
  verifiedStudents: function() {
    var cU = Meteor.user();
    if (!Roles.userIsInRole(cU._id,'parentOrAdvisor'))
      return '';
    var cOA = [];
    var students = cU.profile.childrenOrAdvisees || '';
    if (students) {
      students.forEach(function(studentID,index,students) {
        var student = Meteor.users.findOne(studentID);
        if (student) {
          var name = (student.profile.firstName + ' ' + student.profile.lastName) || student.userName || 'Name not found?';
          student.name = name;
          cOA.push(student);
        }
      });
    }
    return cOA;
  },
  unverifiedStudents: function() {
    var cU = Meteor.user();
    if (!Roles.userIsInRole(cU._id,'parentOrAdvisor'))
      return '';
    var cOA = [];
    var students = cU.profile.childrenOrAdvisees || '';
    if (students) {
      students.forEach(function(studentID,index,students) {
        var student = Meteor.users.findOne(studentID);
        if (!student) {
          student = {_id: studentID, name: studentID};
          cOA.push(student);
        }
      });
    }
    return cOA;
  },
  newStudents: function() {
    var childrenOrAdvisees = loginButtonsSession.get('childrenOrAdvisees');
    if (!childrenOrAdvisees) return '';
    return childrenOrAdvisees.map(function(student) {
      return {name:student};
    });
  },
  newEmails: function() {
    var newEmails = loginButtonsSession.get('newEmails');
    if (!newEmails) return '';
    return newEmails.map(function(email) {
      return {address:email,verified:false};
    });
  },
  roleSelected: function(role) {
    var cU = Meteor.user(); //or ViewAs
    return Roles.userIsInRole(cU,role) ? 'selected' : '';
  }
})

Template.editProfileForm.events({
  "keypress .form-control[type!='student'][type!='email']": function(event,tmpl) {
    event.stopPropagation();
    if (event.keyCode === 13){
      updateProfile(event,tmpl);
    } 
  },
  'keypress .edit-profile-choose-student': function(event,tmpl) {
    if (event.keyCode === 13){
      var childrenOrAdvisees = [];
      tmpl.$('.edit-profile-choose-student').each(function(i,s) {
        var cleanValue = _.clean(s.value);
        if (cleanValue) {
          childrenOrAdvisees.push(cleanValue);
        }
      })
      loginButtonsSession.set('childrenOrAdvisees',childrenOrAdvisees);
      $(event.target).val('');
    }
  },
  'keypress .edit-profile-add-email': function(event,tmpl) {
    if (event.keyCode === 13){
      var emails = [];
      tmpl.$('.edit-profile-add-email').each(function(i,s) {
        if (s.value) {
          emails.push(s.value);
        }
      })
      loginButtonsSession.set('newEmails',emails);
      $(event.target).val('');
    }
  },
  'click .remove-email': function(event,tmpl) {
    event.stopPropagation();
    var cU = Meteor.userId(); //or viewAs
    Meteor.call('removeEmail',cU,this.address,function(error,id) {
      if (error) {
        errorMessage(error.reason || 'Could not remove e-mail.  Unknown error.')
      } else {
        infoMessage('Email successfully removed.');
      }
    });
  },
  'click #edit-profile-save': function(event,tmpl) {
    event.stopPropagation();
    updateProfile(event,tmpl);
  },
  'click #edit-profile-cancel': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();
    loginButtonsSession.set('inEditProfileFlow',false);
  },
  'click .stop-observing': function(event,tmpl) {
    event.stopPropagation();
    var cU = Meteor.userId(); //or viewAs
    var successMessage = (Match.test(this._id,Match.idString)) ? 'You have stopped observing ' : 'You have withdrawn your request to observe ';
    successMessage += this.name + '.';
    Meteor.call('removeChildOrAdvisee',cU,this._id,function(error,id) {
      if (error) {
        errorMessage(error.reason || 'Could not remove child or advisee.  Unknown error.')
      } else {
        infoMessage(successMessage);
      }
    });
  },
})



       /********************************************/
      /****************** HELPERS *****************/
     /******** getVal, getTrimmedVal *************/
    /********* errorMessage, infoMessage ********/
   /***** toggleDropdown, focusInput ***********/
  /*** login, forgotPassword, changePassword **/
 /*** updateProfile **************************/
/********************************************/


var getVal = function(tmpl,id) {
  var $element = $(tmpl.find("#" + id));
  if (!$element){
    return null;
  } else {
    return $element.val();
  }
};

var getTrimmedVal = function(tmpl,id) {
  var $element = $(tmpl.find("#" + id));
  if (!$element){
    return null;
  } else {
    return $element.val().replace(/^\s*|\s*$/g, ""); // trim;
  }
};

var errorMessage = function(errorMessage) {
  loginButtonsSession.errorMessage(errorMessage);
  return false;
};

var infoMessage = function(infoMessage) {
  loginButtonsSession.infoMessage(infoMessage);
  return false;
}

var toggleDropdown = function() {
  $("#login-dropdown-list").toggleClass("open");
}

var focusInput = function() {
  setTimeout(function() {
    $("#login-dropdown-list input").first().focus();
  }, 0);
};

  /********************/
 /****** login *******/
/********************/

var login = function(event,tmpl) {
  loginButtonsSession.resetMessages();
  //loginButtonsSession.infoMessage('heres some info');

  // to be passed to Accounts.createUser
  var usernameOrEmail = getTrimmedVal(tmpl,'login-username-or-email');
    //simple validation as string ... not sure how to handle all the cases or whether I should try
    if (!Match.test(usernameOrEmail,Match.nonEmptyString)) return errorMessage('You must enter a username or an e-mail.');
  var password = getVal(tmpl,'login-password');
    //no validation necessary?

  Meteor.loginWithPassword(usernameOrEmail, password, function(error, result) {
    if (error) {
      if (error.reason == 'User not found') {
        errorMessage('User not found.');
      } else if (error.reason == 'Incorrect password'){
        errorMessage('Incorrect password.');
      } else {
        errorMessage(error.reason || "Unknown error");
      }
    } else {
      loginButtonsSession.closeDropdown();
    }
  });
}

  /******************************/
 /****** forgot password *******/
/******************************/

var forgotPassword = function(event,tmpl) {
  loginButtonsSession.resetMessages();

  var email = getTrimmedVal(tmpl,'forgot-password-email');
  Meteor.call('isEmailVerified',email,function(error,isVerified) {
    if (error) {
      errorMessage(error.reason || 'Email not found. No user on the system has registered this email.')
    } else {
      if (isVerified) {
        Accounts.forgotPassword({
          email: email
        }, function(error) {
          if (error) {
            errorMessage(error.reason || "Unknown error");
          } else {
            infoMessage('Email sent.');
            loginButtonsSession.set('inMessageOnlyFlow',true);
          }
        })
      } else {
        errorMessage('This email has not been verified.  To reset your password, you must use the email you verified when you created your account.')
      }
    }
  })
};

  /******************************/
 /****** change password *******/
/******************************/

var changePassword = function(event,tmpl) {
  loginButtonsSession.resetMessages();
  // notably not trimmed. a password could (?) start or end with a space
  var oldPassword = getVal(tmpl,'change-password-old');
  var password = getVal(tmpl,'change-password-new');
  var passwordAgain = getVal(tmpl,'change-password-new-again');
  
  if (password == oldPassword) return errorMessage("New and old passwords must be different");
  if (!Match.test(password,Match.password)) return errorMessage('Passwords must be at least 8 characters long and contain one lowercase letter, one uppercase letter, and one digit or special character (@#$%^&+=_-)');
  if (!passwordAgain) return errorMessage('Enter password again to confirm.');
  if (passwordAgain != password) return errorMessage("Passwords don't match.");

  Accounts.changePassword(oldPassword, password, function(error) {
    if (error) {
      errorMessage(error.reason || "Unknown error");
    } else {
      loginButtonsSession.infoMessage('Password changed.');
      loginButtonsSession.set('inMessageOnlyFlow',true);
    }
  });
};

  /**************************/
 /****** create user *******/
/**************************/

var createUser = function(event,tmpl) {
  loginButtonsSession.resetMessages();

  // to be passed to Accounts.createUser
  var options = {};
  options.username = getTrimmedVal(tmpl,'login-create-username');
    if (!Match.test(options.username,Match.nonEmptyString)) return errorMessage('You must specify a username.');
    if (options.username.length > 12)  return errorMessage('Keep your user name short (12 characers or less) but unique and recognizable.');
  options.profile = {};
  options.profile.firstName = getTrimmedVal(tmpl,'login-create-firstname');
    if (!Match.test(options.profile.firstName,Match.nonEmptyString)) return errorMessage('Please enter your first name.');
  options.profile.lastName = getTrimmedVal(tmpl,'login-create-lastname');
    if (!Match.test(options.profile.lastName,Match.nonEmptyString)) return errorMessage('Please enter your last name.');

  options.email = getTrimmedVal(tmpl,'login-create-email');
    if (!Match.test(options.email,Match.email)) return errorMessage('Enter a valid e-mail address.');
//    options.password = getVal(tmpl,'login-create-password');
//      if (!Match.test(options.password,Match.password)) return errorMessage('Passwords must be at least 8 characters long and contain one lowercase letter, one uppercase letter, and one digit or special character (@#$%^&+=_-)')
//    var confirm = getVal(tmpl,'login-create-password-again');
//      if (confirm != options.password) return errorMessage("Passwords don't match.");

  var pEi = {}; //post Enrollment info
  pEi.role = $(tmpl.find('#login-create-role')).val();
    if (!Match.test(pEi.role,Match.OneOf('student','teacher','parentOrAdvisor'))) return errorMessage("You must select a role.");
    if (pEi.role == 'student') {
      pEi.sectionID = $(tmpl.find('#login-create-section')).val();
      if (!Match.test(pEi.sectionID,Match.idString)) return errorMessage("You must choose a section.");
      var section = Sections.findOne(pEi.sectionID);
      if (!section) return errorMessage("Invalid section.");
    } else if (pEi.role == 'parentOrAdvisor') {
      pEi.childrenOrAdvisees = [];
      tmpl.$('.login-create-choose-student').each(function(i,s) {
        var cleanValue = _.clean(s.value);
        if (Match.test(cleanValue,Match.nonEmptyString)) {
          pEi.childrenOrAdvisees.push(cleanValue);
        }
      })
    } 
  //currently no extra fields for teacher
  options.profile.postEnrollmentInfo = pEi;

  Meteor.call('createUnvalidatedUser',options,function(error) {
    if (error) {
      errorMessage(error.reason || "Unknown error creating user.");
    } else {
      infoMessage('Once a teacher validates your information, you will receive an e-mail with a link to set your password and activate your account.')
      $('#login-messages-modal').modal();
      loginButtonsSession.set('inSignupFlow',false);
      loginButtonsSession.set('inForgotPasswordFlow', false);
      Template.loginButtons.toggleDropdown();
    }
  })
}

  /*****************************/
 /****** update profile *******/
/*****************************/

var updateProfile = function(event,tmpl) {
  loginButtonsSession.resetMessages();

  // to be passed to updateUser or ...
  var cU = Meteor.user();//or viewAs
  var user = {
    _id:cU._id,
    profile:{}
  }; 
  var username = getTrimmedVal(tmpl,'edit-profile-username');
    if (!Match.test(username,Match.nonEmptyString)) return errorMessage('You must specify a username.');
    if (username.length > 12)  return errorMessage('Keep your user name short (12 characers or less) but unique and recognizable.');
    if (username != cU.username) user.username = username;
  var firstName = getTrimmedVal(tmpl,'edit-profile-firstname');
    if (!Match.test(firstName,Match.nonEmptyString)) return errorMessage('Please enter your first name.');
    if (firstName != cU.profile.firstName) user.profile.firstName = firstName;
  var lastName = getTrimmedVal(tmpl,'edit-profile-lastname');
    if (!Match.test(lastName,Match.nonEmptyString)) return errorMessage('Please enter your last name.');
    if (lastName != cU.profile.lastName) user.profile.lastName = lastName;
  user.emails = [];
  tmpl.$('.edit-profile-add-email').each(function(i,s) {
    var email = s.value;
    if (Match.test(email,Match.nonEmptyString)) {
      if (!Match.test(email,Match.email)) return errorMessage('Enter a valid e-mail address.');
      user.emails.push(email);
    }    
  });

  var pEi = {}; //post Enrollment info ... is there a better name for this here?
    if (Roles.userIsInRole(cU,'teacher')) { 
      var role = tmpl.$('#edit-profile-role').val();
      if (!Match.test(role,Match.OneOf('student','teacher','parentOrAdvisor'))) return errorMessage("You must select a role.");
        if (!Roles.userIsInRole(cU,role) /*&& check if user is teacher?*/) 
          pEi.role = role;
    } else if (Roles.userIsInRole(cU,'student')) {
      var sectionID = $(tmpl.find('#edit-profile-section')).val();
      if (!Match.test(sectionID,Match.idString)) return errorMessage("You must choose a section.");
      var section = Sections.findOne(sectionID);
      if (!section) return errorMessage("Invalid section.");
      var cS = currentSection();
      if ((!cS) || (sectionID != cS._id))
        pEi.sectionID = sectionID;
    } else if (Roles.userIsInRole(cU,'parentOrAdvisor')) {
      pEi.childrenOrAdvisees = [];
      tmpl.$('.edit-profile-choose-student').each(function(i,s) {
        var cleanValue = _.clean(s.value);
        if (Match.test(cleanValue,Match.nonEmptyString)) {
          pEi.childrenOrAdvisees.push(cleanValue);
        }
      })
    } 
  user.profile.postEnrollmentInfo = pEi; 

  Meteor.call('updateUser',user,function(error,userID) {
    if (error) {
      errorMessage(error.reason || 'Unknown error updating profile.');
    } else {
      Meteor.flush();
      infoMessage('Profile successfully updated.');
      loginButtonsSession.set('newEmails',null);
      loginButtonsSession.set('childrenOrAdvisees',null);
      $('.edit-profile-choose-student').val('');
      $('.edit-profile-add-email').val('');
    }
  });

}