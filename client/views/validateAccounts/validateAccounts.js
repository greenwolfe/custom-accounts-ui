Template.validateAccounts.helpers({
  helpMessages: function() { 
    return [
      'For students, parents or advisors, make sure the e-mail they submitted is the same one they registered with the school.',
      'For students, check that they have requested the correct section.',
      'For parents or advisors, make sure they are allowed to observe the students they have requested.',
      "If the student is not found, make sure the student has an account, and the parent/advisor entered the student's name exactly as the student did when creating their account.",
      'When you are sure all of the information is valid, click the button (<a href="#" class="glyphicon glyphicon-send"></a>) to send a validation email.  The user will be sent an e-mail with a link returning them to openlab and allowing them to set their password.  They cannot log in until they have a password.'
    ]
  },
  users: function() {
    var users = Meteor.users.find().fetch();
    users = users.filter(function(user) {
      var verified = false;
      user.emails.forEach(function(email) {
        verified = verified || email.verified;
      });
      return !verified;  //keep only users without a verified email
    })
    return users;
  }
})