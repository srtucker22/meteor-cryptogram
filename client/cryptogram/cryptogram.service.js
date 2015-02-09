// 'the quick brown fox jumped over the lazy dog'
// you're going to need a string for the puzzle
// you're going to need a dictionary with key: letter, value: [array of locations in string]

// a separate dictionary for the user's assignments of letters
// method checks the dictionary for dupes to assign red


(function(){

  angular.module('app').factory('cryptogramService', cryptogramService);

  cryptogramService.$inject = [];

  function cryptogramService(){
    var service = {
      checkSolution: checkSolution,
      createCryptogram: createCryptogram,
      getCryptogramn: getCryptogram,
      getEmptyCode: getEmptyCode,
      getLetterIndexMap: getLetterIndexMap,
      getInvalidCharacters: getInvalidCharacters,
      isLetter: isLetter
    };

    return service;

    ///////////////////

    // call the server to check for the solution to the cryptogram
    function checkSolution(cryptogram, code){
      return !getInvalidCharacters(code).length && _.isEqual(code, cryptogram.code);
    }

    function createCryptogram(str){
      // first make the string lowercase
      str = str.toLowerCase();

      // make a couple of arrays of the alphabet
      var letters = _.filter(_.toArray("abcdefghijklmnopqrstuvwxyz"), function(c){
        return str.indexOf(c) >= 0;
      });
      var alphabet = letters.slice(0);
      shuffle(alphabet);  // shuffle one of the alphabets
      var code = _.object(letters, alphabet); // map them together for the code
      var reverse_code = _.object(alphabet, letters); // map them together for the code

      // map each character in str using the code
      var cryptogram = {};
      cryptogram.puzzle = '';
      cryptogram.letterIndexMap = {};
      _.each(str, function(c, index){
        if(code[c]){
          cryptogram.puzzle += code[c];
          if(cryptogram.letterIndexMap[code[c]]){
            cryptogram.letterIndexMap[code[c]].push(index);
          }else{
            cryptogram.letterIndexMap[code[c]] = [index];
          }
        }else{
          cryptogram.puzzle += c;
        }
      });
      cryptogram.code = reverse_code;
      return cryptogram;
    }

    // get a cryptogram from the server either by id or random
    function getCryptogram(cryptogram){
      if(cryptogram){

      }else{
        return createCryptogram('the quick brown fox jumped over the lazy dog');
      }
    }

    function getEmptyCode(puzzle){
      return _.object(
        _.map(
          _.filter("abcdefghijklmnopqrstuvwxyz", function(c){
            return puzzle.indexOf(c) >= 0;}
          ), function(c){
        return [c, ''];
      }));
    }

    function getLetterIndexMap(str){
      var letterIndexMap = {};
      _.each(str, function(c, index){
        if(c.match(/^[a-zA-Z]*$/)){
          if(letterIndexMap[c]){
            letterIndexMap[c].push(index);
          }else{
            letterIndexMap[c] = [index];
          }
        }
      });
      return letterIndexMap;
    }

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

    // return all letters where the user has assigned multiple values or invalid characters
    function getInvalidCharacters(code){
      var existing = {};
      return _.filter(code, function(c){
        if(c.length > 1 || !c.match(/^[a-zA-Z]*$/) || existing[c] && c !== ''){
          return true;
        }else{
          existing[c] = true;
          return false;
        }
      });
    }

    function isLetter(c){
      return !!c.match(/^[a-zA-Z]*$/);
    }
  }
})();