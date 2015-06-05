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
      console.log(error);
      loginButtonsSession.closeDropdown();
    });
  },
  'click #login-buttons-open-change-password': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.set('inChangePasswordFlow',true);
  },
  'click #login-buttons-logout-message-only-OK': function(event,tmpl) {
    loginButtonsSession.closeDropdown();
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
      if (usernameOrEmail.indexOf('@') === -1){
        $('#login-create-username').val(usernameOrEmail);
      } else {
        $('#login-create-email').val(usernameOrEmail);
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

    if ((usernameOrEmail) && (usernameOrEmail.indexOf('@') > 0))
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
    loginButtonsSession.resetMessages();
    //loginButtonsSession.infoMessage('heres some info');

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
          if (cleanValue) {
            pEi.childrenOrAdvisees.push(cleanValue);
          }
        })
//        options.profile.childrenOrAdvisees = childrenOrAdvisees;
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
/*    Accounts.createUser(options, function(error) {
      if (error) {
        errorMessage(error.reason || "Unknown error creating user.");
      } else {
        userID = Meteor.userId();
        Meteor.call('assignRole',userID,role,function(error,userID) {
          if (error) {
            errorMessage(error.reason || "Unknown error assignint role.");
          } else {
            if (role == 'student') {
              Meteor.call('addMember',{
                member: userID,
                in: sectionID,
                of: 'Sections'
              },function(error,id) {
                if (error)
                  errorMessage(error.reason || "Unknown error assigning user to role.")
              })
            }            
          }
        });
        loginButtonsSession.closeDropdown();
      }
    });*/
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



        /********************************************/
       /****************** HELPERS *****************/
      /******** getVal, getTrimmedVal *************/
     /********* errorMessage, infoMessage ********/
    /***** toggleDropdown, focusInput ***********/
   /*****      ... are these actually used? ****/
  /*** login, forgotPassword, changePassword **/
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

var forgotPassword = function(event,tmpl) {
  loginButtonsSession.resetMessages();

  var email = getTrimmedVal(tmpl,'forgot-password-email');
  if (email.indexOf('@') !== -1) {
    Accounts.forgotPassword({
      email: email
    }, function(error) {
      if (error) {
        errorMessage(error.reason || "Unknown error");
      } else {
        infoMessage('Email sent.');
        loginButtonsSession.set('inMessageOnlyFlow',true);
      }
    });
  } else {
    errorMessage('Invalid email');
  }
};

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