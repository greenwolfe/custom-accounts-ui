

  /**********************************/
 /******* SET PASSWORD DIALOG ******/
/**********************************/

var doneCallback;

Accounts.onEnrollmentLink(function(token,done) {
  loginButtonsSession.set('enrollAccountToken',token);
  doneCallback = done;
}) 

Accounts.onResetPasswordLink(function(token,done) {
  loginButtonsSession.set('resetPasswordToken',token);
  doneCallback = done;
}) 

Template.setPasswordDialog.onRendered(function() {
  this.autorun(function() {
    var token = loginButtonsSession.get('enrollAccountToken') ||
                loginButtonsSession.get('resetPasswordToken');
    if (token) 
      $('#login-set-password-modal').modal();
  })
})

Template.setPasswordDialog.events({
	'click #login-set-password': function(event,tmpl) {
    setPassword(event,tmpl);
  },
  'keypress #login-create-password, keypress #login-create-password-again': function(event,tmpl) {
    if (event.keyCode === 13) {
      setPassword(event,tmpl);
    }
  },
  'click #login-cancel-set-password-dialog': function() {
    loginButtonsSession.resetMessages();
    loginButtonsSession.set('enrollAccountToken',null);
    loginButtonsSession.set('resetPasswordToken',null)
    $('#login-set-password-modal').modal('hide');
  }  
}) 

  /**********************************/
 /******* SET PASSWORD DIALOG ******/
/**********************************/

Template.loginMessagesDialog.events({
  'click #login-cancel-message-dialog': function(event,tmpl) {
    $('#login-messages-modal').modal('hide');
    loginButtonsSession.resetMessages();
  }
})

Template.setPasswordDialog.helpers({
  cancelOrClose: function() {
    if (loginButtonsSession.get('enrollAccountToken') ||
        loginButtonsSession.get('resetPasswordToken')) {
      return 'Cancel';
    }
    return 'Close';
  }
})

  /**********************/
 /******* HELPERS ******/
/**********************/

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

var setPassword = function(event,tmpl) {
  loginButtonsSession.resetMessages();
  var token = loginButtonsSession.get('enrollAccountToken') || 
              loginButtonsSession.get('resetPasswordToken');
    if (!Match.test(token,Match.enrollmentTokenString)) return errorMessage('Invalid enrollment token.');
  var password = getVal(tmpl,'login-create-password');
    if (!Match.test(password,Match.password)) return errorMessage('Passwords must be at least 8 characters long and contain one lowercase letter, one uppercase letter, and one digit or special character (@#$%^&+=_-)')
  var confirm = getVal(tmpl,'login-create-password-again');
    if (confirm != password) return errorMessage("Passwords don't match.");

  Accounts.resetPassword(token,password, function(error) {
    if (error) {
      if (error.message === 'Token expired [403]') {
        errorMessage('Sorry, this link has expired.');
      } else {
        errorMessage('Sorry, there was a problem resetting your password.');          
      }
    } else {
      infoMessage('Success!  Your password has been changed.');  // This doesn't show. Display on next page
      loginButtonsSession.set('enrollAccountToken', null);
      loginButtonsSession.set('resetPasswordToken',null);
      // Call done before navigating away from here
      if (doneCallback) {
        doneCallback();
      }
      //Router.go('/');
    } 
  }); 
}
