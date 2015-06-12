Meteor.startup(function () {
  if (Roles.getUsersInRole('teacher').count() == 0) {
    var profile = {
      firstName: 'Teacher',
      lastName: 'One'
    }
    var id = Accounts.createUser({
      password: "Pa33word",
      email: "teacher1@mailinator.com",
      username: 'teacher1',
      profile: profile
    });
    Roles.addUsersToRoles(id, ['teacher']);
  };
});