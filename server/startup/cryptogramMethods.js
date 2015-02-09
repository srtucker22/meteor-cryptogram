var defaultQuoteParams = {
  'format': 'text',
  'min_lines': 4
};

// manipulate cryptograms
Meteor.methods({
  /**
   * get a cryptogram puzzle
   *
   * @param {String} cryptogramId optional _id of cryptogram to send
   */
  getCryptogram: function (cryptogramId) {
    
    var cryptogram;

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
      if(loggedInUser && loggedInUser.cryptograms){
        // if the user left a puzzle, return the one they were working on
        if(loggedInUser.cryptograms.current){
          cryptogram = Cryptograms.findOne({_id: loggedInUser.cryptograms.current});
          if(cryptogram)
            return {_id: cryptogramId, puzzle: getCryptogram(cryptogram.answer)};
          else{
            throw new Meteor.Error('cryptogram not found');
          }
        }else{  // give the user a new puzzle
          cryptogram = Cryptograms.findOne({
            _id: {
              $nin: _.union(loggedInUser.cryptograms.solved, loggedInUser.cryptograms.failed)}, 
            rnd: {
              $gte: Math.random()
            }
          });
          if(cryptogram){
            return {_id: cryptogram._id, puzzle: createCryptogram(cryptogram.answer)};
          }else{
            throw new Meteor.Error('cryptogram not found');
          }
        }
      }else{  // give the rando a rando puzzle
        cryptogram = Cryptograms.findOne({rnd: {$gte: Math.random()}});
        return {_id: cryptogram._id, puzzle: createCryptogram(cryptogram.answer)};
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
    
  },

  /**
   * return a random quote with options (can't use min characters because their API is busted)
   *
   * @param {Object} options -- options for the API specified here: http://iheartquotes.com/api
   */
  getRandomQuote: function(params){
    params = params? params: defaultQuoteParams;
    
    var url = "http://www.iheartquotes.com/api/v1/random";

    this.unblock();
    try {
      var result = HTTP.call("GET", url, {params: params});
      return result;
    } catch (e) {
      // Got a network error, time-out or HTTP error in the 400 or 500 range.
      throw new Meteor.Error(e);
    }
  },

  /**
   * check the solution to a given cryptogram
   * 
   * @param {String} cryptogramId _id of the cryptogram
   * @param {String} solution the user's solution
   */
  checkSolution: function (cryptogramId, solution) {
    var cryptogram = Cryptograms.findOne({_id: cryptogramId});
    if(!cryptogram){
      throw new Meteor.Error('cryptogram not found'); 
    }else{
      return _.isEqual(cryptogram.answer, solution);
    }
  },
});


// shuffle a string by replacing the letters efficiently
function createCryptogram(str){
  // first make the string lowercase
  str = str.toLowerCase();

  // make a couple of arrays of the alphabet
  var letters = _.filter(_.toArray("abcdefghijklmnopqrstuvwxyz"), function(c){
    return str.indexOf(c) >= 0;
  });
  var shuffled = shuffle(letters.slice(0)); // shuffle the alphabet
  var code = _.object(letters, shuffled); // map them together for the code

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