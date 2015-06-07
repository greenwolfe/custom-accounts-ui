Router.route('/', {
  name: 'progressPlan',
  layoutTemplate: 'layout',
  yieldRegions: {
    'progressPlanHeader': {to: 'header'}
  },
  subscriptions: function() {
    //returning a subscription handle or an array of subscription handles
    //adds them to the wait list
    //can use onAfterAction to load additional subscriptions behind the scenes?
    return [
      Meteor.subscribe('sections'), 
      Meteor.subscribe('userList'),
      Meteor.subscribe('memberships')
    ]
  },
  action: function() {
    if (this.ready()) {
      this.render();
    } else {
      this.render('loading');
    };
  }
})