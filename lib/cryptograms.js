var Schema = {};

Schema.Cryptogram = new SimpleSchema({
  answer: {
    type: String,
    label: "answer",
  },
  difficulty: {
    type: Number,
    label: "difficulty",
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
  },
  rnd: {
    type: Number,
      autoValue: function() {
        if (this.isInsert) {
          return Math.random()();
        } else if (this.isUpsert) {
          return {$setOnInsert: Math.random()};
        } else {
          this.unset();
        }
      }
  }
});

Cryptograms = new Mongo.Collection("cryptograms");

Cryptograms.attachSchema(Schema.Cryptogram);

Cryptograms.allow({
  insert: function (userId, cryptogram) {
    console.log('inserting ' + cryptogram.name);
    return userId && (cryptogram.owner === userId || Roles.userIsInRole(userId, ['manage-users','admin']));
  },
  update: function (userId, cryptogram, fields, modifier) {
    console.log('updating ' + cryptogram.name);
    return userId && (cryptogram.owner === userId || Roles.userIsInRole(userId, ['manage-users','admin']));
  },
  remove: function (userId, cryptogram) {  // only remove a cryptogram once wepay account is removed
    return !cryptogram.wepay && userId && Roles.userIsInRole(userId, ['manage-users','admin']);
  }
});

Cryptograms.deny({
  update: function(userId, cryptogram, fields, modifier){

    // basic denied fields
    var denied = [];
    if(_.intersection(fields, denied).length && !Roles.userIsInRole(userId, ['manage-users','admin'])){
      return true;
    }

    return false;
  }
});