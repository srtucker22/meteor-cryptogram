(function(){

  angular.module('app').factory('cryptogramService', cryptogramService);

  cryptogramService.$inject = [];

  function cryptogramService(){
    var service = {
      getEmptyCode: getEmptyCode,
      getLetterIndexMap: getLetterIndexMap,
      getInvalidCharacters: getInvalidCharacters,
      isLetter: isLetter
    };

    return service;

    ///////////////////

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

    // return whether the given character is a letter
    function isLetter(c){
      return c && !!c.match(/^[a-zA-Z]*$/);
    }
  }
})();