//////////// users

// server: publish the cryptogram data for the user
Meteor.publish("my_data", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
      {fields: {'cryptograms': 1}});
  } else {
    this.ready();
  }
});

//////////// guesses

// server: publish the guesses owned by the user
Meteor.publish("my_guesses", function () {
  if (this.userId) {
    return Guesses.find({owner: this.userId});
  } else {
    this.ready();
  }
});

