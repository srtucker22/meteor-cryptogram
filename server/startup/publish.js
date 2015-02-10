//////////// users

// server: publish the phone, timezone, and commitments for this user
Meteor.publish("my_data", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
      {fields: {'cryptograms': 1}});
  } else {
    this.ready();
  }
});