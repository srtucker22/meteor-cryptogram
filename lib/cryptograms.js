var Schema = {};

Schema.Cryptogram = new SimpleSchema({
  owner: {
    type: String,
    label: 'owner id',
    optional: true
  },
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
    decimal: true,
      autoValue: function() {
        if (this.isInsert) {
          return Math.random();
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
    var response = cryptogram.owner ? userId && (cryptogram.owner === userId || Roles.userIsInRole(userId, ['manage-users','admin'])) : false;
    return response;
  },
  update: function (userId, cryptogram, fields, modifier) {
    var response = cryptogram.owner ? userId && (cryptogram.owner === userId || Roles.userIsInRole(userId, ['manage-users','admin'])) : false;
    return response;
  },
  remove: function (userId, cryptogram, fields, modifier) {
    var response = cryptogram.owner ? userId && (cryptogram.owner === userId || Roles.userIsInRole(userId, ['manage-users','admin'])) : false;
    return response;
  },
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