// for convenience ... why does ian not have to worry about file load order like this?
var loginButtonsSession;

Template.loginButtons.onRendered(function() {
  loginButtonsSession = Accounts._loginButtonsSession;
}) 

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

Template.logOutDropdown.events({
  'click #login-buttons-logout': function(event,tmpl) {
    Meteor.logout(function(error) {
      console.log(error);
      loginButtonsSession.closeDropdown();
    });
  }
})

Template.loginButtons.toggleDropdown = function() {
  toggleDropdown();
  focusInput();
};

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
    var password = getVal(tmpl,'login-password');

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
    if (password)
      $('#login-create-password').val(password);
  },
});

Template.createAccountForm.helpers({
  sections: function() {
    return Sections.find();
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
  'click #login-buttons-cancel-create': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();

    var username = getTrimmedVal(tmpl,'login-create-username');
    var email = getTrimmedVal(tmpl,'login-create-email');
    var password = getVal(tmpl,'login-create-password');

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
    if (password) 
      $('#login-password').val(password);
  },
  'click #login-buttons-create': function(event,tmpl) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();
    //loginButtonsSession.infoMessage('heres some info');

    // to be passed to Accounts.createUser
    var options = {};
    options.username = getTrimmedVal(tmpl,'login-create-username');
      if (!Match.test(options.username,Match.nonEmptyString)) return errorMessage('You must specify a username.');
      if (options.username.length > 10)  return errorMessage('Keep your user name short (12 characers or less) but unique and recognizable.');
    options.profile = {};
    options.profile.firstName = getTrimmedVal(tmpl,'login-create-firstname');
      if (!Match.test(options.profile.firstName,Match.nonEmptyString)) return errorMessage('Please enter your first name.');
    options.profile.lastName = getTrimmedVal(tmpl,'login-create-firstname');
      if (!Match.test(options.profile.lastName,Match.nonEmptyString)) return errorMessage('Please enter your last name.');

    options.email = getTrimmedVal(tmpl,'login-create-email');
      if (!Match.test(options.email,Match.email)) return errorMessage('Enter a valid e-mail address.');
    options.password = getVal(tmpl,'login-create-password');
      if (!Match.test(options.password,Match.password)) return errorMessage('Passwords must be at least 8 characters long and contain one lowercase letter, one uppercase letter, and one digit or special character (@#$%^&+=_-)')
    var confirm = getVal(tmpl,'login-create-password-again');
      if (confirm != options.password) return errorMessage("Passwords don't match.");

    var role = $(tmpl.find('#login-create-role')).val();
      if (!Match.test(role,Match.OneOf('student','teacher','parentOrAdvisor'))) return errorMessage("You must select a role.");
      if (role == 'student') {
        var sectionID = $(tmpl.find('#login-create-section')).val();
        if (!Match.test(sectionID,Match.idString)) return errorMessage("You must choose a section.");
        var section = Sections.findOne(sectionID);
        if (!section) return errorMessage("Invalid Section.");
        options.profile.sections = {};
        options.profile.sections[sectionID] = {from: , to: }
    }


    Accounts.createUser(options, function(error) {
      if (error) {
        loginButtonsSession.errorMessage(error.reason || "Unknown error");
      } else {
        loginButtonsSession.closeDropdown();
      }
    });
  }
})

  //
  // helpers
  //

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
  Accounts._loginButtonsSession.errorMessage(errorMessage);
  return false;
};

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