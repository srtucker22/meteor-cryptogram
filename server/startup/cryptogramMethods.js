var fs = Npm.require('fs');

var defaultQuoteParams = {
  'format': 'text',
  'min_lines': 4
};

var maxHints = 3;

// manipulate cryptograms
Meteor.methods({
  /**
   * check the solution to a given cryptogram
   * 
   * @param {String} cryptogramId _id of the cryptogram
   * @param {String} solution the user's solution
   */
  checkSolution: function (cryptogramId, solution) {
    var cryptogram = Cryptograms.findOne({_id: cryptogramId});
    if(!cryptogram)
      throw new Meteor.Error('cryptogram not found'); 

    var isCorrect = _.isEqual(cryptogram.answer.toLowerCase(), solution.toLowerCase());
    
    var loggedInUser = Meteor.user();
    
    // if the user is logged in and correctly guesses the puzzle, update their stats
    if(loggedInUser && isCorrect){
      Meteor.users.update({_id: loggedInUser._id}, {$unset: {'cryptograms.current': ''}, $push: {'cryptograms.solved': cryptogramId}});
    }
    
    return isCorrect;
  },

  createCryptogram: function(str) {
    return createCryptogram(str);
  },

  /**
   * get a cryptogram puzzle
   *
   * @param {String} cryptogramId optional _id of cryptogram to send
   */
  getCryptogram: function (cryptogramId) {
    
    var cryptogram;
    var counter = 0;

    if(cryptogramId){ // if an id is passed, find the cryptogram and return it
      cryptogram = Cryptograms.findOne({_id: cryptogramId});
      if(cryptogram)
        return {_id: cryptogramId, puzzle: getCryptogram(cryptogram.answer)};
      else{
        throw new Meteor.Error('cryptogram not found');
      }
    }else{
      
      var loggedInUser = Meteor.user();

      // if the user is logged in and has a history, give them their current puzzle or a new one
      if(loggedInUser){
        // if the user left a puzzle, return the one they were working on
        if(loggedInUser.cryptograms && loggedInUser.cryptograms.current){
          cryptogram = Cryptograms.findOne({_id: loggedInUser.cryptograms.current.cryptogram});
          if(cryptogram)
            return {_id: cryptogram._id, puzzle: createCryptogram(cryptogram.answer)};
          else{
            Meteor.users.update({_id: loggedInUser._id}, {$unset: {'cryptograms.current': 1}});
            return Meteor.call('getCryptogram');
          }
        }else{  // give the user a new puzzle
          counter = 0;
          while(!cryptogram && counter<10){ // try 10 times before failing
            if(loggedInUser.cryptograms){
              cryptogram = Cryptograms.findOne({
                _id: {
                  $nin: _.union(
                    loggedInUser.cryptograms.solved ? loggedInUser.cryptograms.solved : [], 
                    loggedInUser.cryptograms.failed ? loggedInUser.cryptograms.failed: [])}, 
                rnd: {
                  $gte: Math.random()
                }
              });
            }else{
              cryptogram = Cryptograms.findOne({rnd: {$gte: Math.random()}});
            }
            counter++;
          }
          if(cryptogram){
            Meteor.users.update({_id: loggedInUser._id}, {$set: {'cryptograms.current': {cryptogram: cryptogram._id, hints: maxHints}}});  // update the current puzzle for the user and give them hints
            return {_id: cryptogram._id, puzzle: createCryptogram(cryptogram.answer)};
          }else{
            var newCryptogram = Cryptograms.insert({answer: getRandomQuote({minLength: 100, variance: 200})});
            Meteor.users.update({_id: loggedInUser._id}, {$set: {'cryptograms.current': {cryptogram: newCryptogram._id, hints: maxHints}}});  // update the current puzzle for the user and give them hints
            return Cryptograms.findOne({_id: newCryptogram});
          }
        }
      }else{  // give the rando a rando puzzle
        counter = 0;
        while(!cryptogram && counter<10){
          cryptogram = Cryptograms.findOne({rnd: {$gte: Math.random()}});
          counter++;
        }
        if(cryptogram){
          return {_id: cryptogram._id, puzzle: createCryptogram(cryptogram.answer)};
        }
        else{
          var newC = Cryptograms.insert({answer: getRandomQuote({minLength: 100, variance: 200})});
          console.log('new cryptogram created');
          return Cryptograms.findOne({_id: newC});
        }
      }   
    }
  },

  /**
   * return a hint for a given cryptogram (only 1 letter)
   *
   * @param {String} cryptogramId the _id of the cryptogram 
   * @param {String} currentSolution the user's current solution
   */
  getHint: function (cryptogramId, currentSolution) {
    var loggedInUser = Meteor.user();
    if(!loggedInUser){
      throw new Meteor.Error("user must be logged in to receive hints");
    }

    var cryptogram = Cryptograms.findOne({_id: cryptogramId});
    if(!cryptogram){
      throw new Meteor.Error("cryptogram not found");
    }

    try{
      if(loggedInUser.cryptograms.current.hints){

        currentSolution = currentSolution.toLowerCase();

        var hints = [];

        // find all the inconsistencies between the solution and the current solution
        _.each(cryptogram.answer.toLowerCase(), function(letter, index){
          if(letter !== currentSolution[index]){
            hints.push({letter: letter, index: index});
          }
        });

        Meteor.users.update({_id: loggedInUser._id}, {$inc: {'cryptograms.current.hints': -1}});

        // return a random hint
        return _.first(_.sample(hints, 1));
      }
    }catch(err){
      throw new Meteor.Error("couldn't find hints");
    }
  },

  /**
   * log the user's failed attempt and return the answer
   *
   * @param {String} cryptogramId the _id of the cryptogram 
   */
  giveUp: function(cryptogramId){

    var cryptogram = Cryptograms.findOne({_id: cryptogramId});
    if(!cryptogram){
      throw new Meteor.Error("cryptogram not found");
    }

    var loggedInUser = Meteor.user();
    if(loggedInUser){
      Meteor.users.update({_id: loggedInUser._id}, {$unset: {'cryptograms.current': ''}, $push: {'cryptograms.failed': cryptogramId}});
    }

    return cryptogram.answer;
  },

  /**
   * return a random quote with options (can't use min characters because their API is busted)
   *
   * @param {Object} options -- options for the API specified here: http://iheartquotes.com/api
   */
  getRandomQuote: function(p){

    var params = p? p:{};

    // // shitty api
    // params = params? params: defaultQuoteParams;
    
    // var url = "http://www.iheartquotes.com/api/v1/random";

    this.unblock();

    // I want to find the files!
    // var files = fs.readdirSync(process.cwd());
    // console.log(files);

    var filenames = [
      'alice_in_wonderland.txt',
      'around_the_world_in_80_days.txt',
      'journey_to_the_center_of_the_earth.txt',
      'kamasutra.txt',
      'moby_dick.txt',
      'o_pioneers.txt',
      'peter_pan.txt',
      'pride_and_prejudice.txt',
      'the_adventures_of_sherlock_holmes.txt',
      'the_adventures_of_tom_sawyer.txt',
      'the_mysterious_island.txt',
      'treasure_island.txt',
      'twenty_thousand_leagues_under_the_sea.txt',
      'ulysses.txt'];

    var randomBookNumber = Math.floor(Math.random() * filenames.length);

    try {
      var result = Assets.getText(filenames[randomBookNumber]).replace(/(?:\r\n|\r|\n)/g, " ");

      var randomLength = Math.floor((Math.random() * (params.variance? params.varaiance: 2000) + (params.minLength? params.minLength : 1000)));

      // start from a random point in the text
      var randomSection = Math.floor((Math.random() * (result.length - randomLength)));
      
      // try to start at a new word
      var startPoint = result.indexOf(' ', randomSection) > 0? result.indexOf(' ', randomSection) + 1 : randomSection;
      
      // try to end at the end of a word
      var endPoint = result.indexOf(' ', startPoint + randomLength) > 0? result.indexOf(' ', startPoint + randomLength) : startPoint + randomLength;
      
      // return the substring
      return result.substring(startPoint, endPoint);
    } catch (e) {
      console.log(e);
      throw new Meteor.Error(e);
    }
  },
});


// shuffle a string by replacing the letters efficiently
function createCryptogram(str){
  // first make the string lowercase
  str = str.toLowerCase();

  var alphabet = _.toArray("abcdefghijklmnopqrstuvwxyz");

  // make a couple of arrays of the alphabet
  var letters = _.filter(alphabet, function(c){
    return str.indexOf(c) >= 0;
  });
  var shuffled = shuffle(alphabet); // shuffle the alphabet

  var code = _.object(letters, shuffled.slice(0, letters.length)); // map them together for the code

  // map each character in str using the code
  var puzzle = _.map(str, function(l){
    return code[l]? code[l]: l;
  }).join('');
  return puzzle;
}


// shuffle the alphabet randomly and evenly
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}