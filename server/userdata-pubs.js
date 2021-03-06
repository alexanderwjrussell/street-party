Meteor.publish('userData', function() {
     var currentUser;
     currentUser = this.userId;
     if (currentUser) {
         return Meteor.users.find({
             _id: currentUser
         }, {
         fields: {
             // Default
             "emails": 1,
             // Created profile property
             "profile": 1
         }
      });
    } else {
      return this.ready();
  }
});
