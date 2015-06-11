

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

Template.setPasswordDialog.onCreated(function() { 
  this.Session = new ReactiveDict; //private session for each instance of the template
  this.Session.set('message',null); //{type:[danger,success, info, warning, primary],text:'some message'}
})

Template.setPasswordDialog.onRendered(function() {
  this.autorun(function() {
    var token = loginButtonsSession.get('enrollAccountToken') ||
                loginButtonsSession.get('resetPasswordToken');
    if (token) 
      $('#login-set-password-modal').modal();
  })
})

/* set password events */
Template.setPasswordDialog.events({
	'click #login-set-password': function(event,tmpl) {
    setPassword(event,tmpl);
  },
  'keypress #login-create-password, keypress #login-create-password-again': function(event,tmpl) {
    if (event.keyCode === 13) {
      setPassword(event,tmpl);
    }
  },
  'click #login-cancel-set-password-dialog': function(event,tmpl) {
    tmpl.Session.set('message',null);
    loginButtonsSession.set('enrollAccountToken',null);
    loginButtonsSession.set('resetPasswordToken',null);
    $('#login-set-password-modal').modal('hide');
  }  
}) 


/* set password helpers */
Template.setPasswordDialog.helpers({
  session: function(key) {
    var tmpl = Template.instance();
    return tmpl.Session.get(key);
  },
  cancelOrClose: function() {
    if (loginButtonsSession.get('enrollAccountToken') ||
        loginButtonsSession.get('resetPasswordToken')) {
      return 'Cancel';
    }
    return 'Close';
  }
})

/* set password */
var setPassword = function(event,tmpl) {
  tmpl.Session.set('message',null);
  var token = loginButtonsSession.get('enrollAccountToken') || 
              loginButtonsSession.get('resetPasswordToken');
    if (!Match.test(token,Match.enrollmentTokenString)) return tmpl.Session.set('message',{type:'danger',text:'Invalid enrollment token.'});
  var password = getVal(tmpl,'login-create-password');
    if (!Match.test(password,Match.password)) return tmpl.Session.set('message',{type:'danger',text:'Passwords must be at least 8 characters long and contain one lowercase letter, one uppercase letter, and one digit or special character (@#$%^&+=_-)'})
  var confirm = getVal(tmpl,'login-create-password-again');
    if (confirm != password) return tmpl.Session.set('message',{type:'danger',text:"Passwords don't match."});

  Accounts.resetPassword(token,password, function(error) {
    if (error) {
      if (error.message === 'Token expired [403]') {
        loginButtonsSession.set('messageOnly',{type:'danger',text:'Sorry, this link has expired.'});
      } else {
        loginButtonsSession.set('messageOnly',{type:'danger',text:'Sorry, there was a problem resetting your password.'});          
      }
    } else {
      loginButtonsSession.set('messageOnly',{type:'success',text:'Success!  Your password has been changed.'});  
    }
    loginButtonsSession.set('enrollAccountToken', null);
    loginButtonsSession.set('resetPasswordToken',null);
    $('#login-set-password-modal').modal('hide');
    $('#login-message-only-modal').modal();
    // Call done before navigating away from here
    if (doneCallback) {
      doneCallback();
    }
    Router.go('/');
  }); 
}

  /**************************************/
 /***** LOGIN MESSAGE ONLY DIALOG ******/
/**************************************/

Template.loginMessageOnlyDialog.helpers({
  messageOnly: function() {
    return loginButtonsSession.get('messageOnly');
  }
})

Template.loginMessageOnlyDialog.events({
  'click #login-cancel-message-only': function(event,tmpl) {
    $('#login-message-only-modal').modal('hide');
    loginButtonsSession.set('messageOnly',null);
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


