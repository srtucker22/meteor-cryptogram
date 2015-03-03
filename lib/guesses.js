var Schema = {};

Schema.Guesses = new SimpleSchema({
  owner: {
    type: String,
    label: "owner"
  },
  puzzle: {
    type: String,
    label: "puzzle",
  },
  status: {
    type: Object,
    label: "status",
    blackbox: true,
    optional: true
  },
  kill: {
    type: Boolean,
    label: "kill",
    optional: true
  },
  createdAt: {
    type: Date,
      autoValue: function() {
        if (this.isInsert) {
          return new Date();
        } else if (this.isUpsert) {
          return {$setOnInsert: new Date()};
        } else {
          this.unset();
        }
      }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  }
});

Guesses = new Mongo.Collection("guesses");

Guesses.attachSchema(Schema.Guesses);

Guesses.allow({
  insert: function (userId, guess) {
    return userId && (guess.owner === userId || Roles.userIsInRole(userId, ['manage-users','admin']));
  },
  update: function (userId, guess, fields, modifier) {
    var response = guess.owner ? userId && (guess.owner === userId || Roles.userIsInRole(userId, ['manage-users','admin'])) : false;
    return response;
  }
});

Guesses.deny({
  remove: function (userId, guesses) {  // only remove a cryptogram once wepay account is removed
    return !Roles.userIsInRole(userId, ['manage-users','admin']);
  }
});