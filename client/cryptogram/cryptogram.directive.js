(function(){
  angular.module("app").directive('cryptogram', cryptogramDirective);

  cryptogramDirective.$inject = ['cryptogramService'];

  function cryptogramDirective(cryptogramService) {
    this.link = function(scope, element, attrs) {
      scope.maxLineChars = attrs.maxLineChars? attrs.maxLineChars:20;

      scope.letterIndexMap = cryptogramService.getLetterIndexMap(scope.puzzle);
      
      scope.$watch('puzzle', function(puzzle){
        refreshView(puzzle);
      });
      
      scope.code = cryptogramService.getEmptyCode(scope.puzzle);

      scope.remainingLetters = function(){
        return _.difference('abcdefghijklmnopqrstuvwxyz', _.values(scope.code)).join(' ');
      };

      // look for invalid characters when the model changes
      scope.$watchCollection('code', function(code){
        scope.invalidCharacters = _.object(_.map(cryptogramService.getInvalidCharacters(scope.code), function(o){
          return [o, true];
        }));
      });

      function refreshView(puzzle){
        var words = scope.puzzle.split(/[\s]+/);

        scope.lines = [];
        var counter = 0;
        var currentLine = '';
        _.each(words, function(word){
          if(currentLine.length + word.length > scope.maxLineChars){
            scope.lines.push(currentLine.slice(0,-1));
            currentLine = word + ' ';
            counter = word.length;
          } else if(currentLine.length + word.length === scope.maxLineChars){
            currentLine += word;
            scope.lines.push(String(currentLine));
            currentLine = '';
          } else {
            currentLine += word + ' ';
          }
        });
        if(currentLine){
          scope.lines.push(currentLine.slice(0,-1));
        }

        // setTimeout(function () {
        //   $.autotab.refresh();
        // }, 1);
      }

      scope.submit = function(){
        console.log(cryptogramService.checkSolution(scope.answer, scope.code));
      };

      scope.hint = function(){
        console.log("hint");
      };
    };
    
    return {
      templateUrl: 'client/cryptogram/cryptogram-template.tpl',
      restrict: 'EA',
      compile: function(tElem){
        return link;
      },
      controller: cryptogramDirectiveController,
      scope: {
        puzzle: "=puzzle",
        answer: "@answer"
      }
    };
  }

  cryptogramDirectiveController.$inject = ['$scope', '$element', '$attrs'];
  
  function cryptogramDirectiveController($scope, $element, $attrs){
    this.setFocusLetter = function(c){
      $scope.focusLetter = c;
    };
  }

  angular.module("app").directive('cryptogramLetter', cryptogramLetterDirective);

  cryptogramLetterDirective.$inject = ['cryptogramService', '$compile'];

  function cryptogramLetterDirective(cryptogramService, $compile) {
    this.link = function(scope, elem, attrs, cryptogramController){

      var letterElement = '<p>{{letter}}</p>';

      elem.append(letterElement);
      
      if(cryptogramService.isLetter(scope.letter)){
        var inputElement = angular.element('<input type="text" maxlength="1" ng-focus="setFocusLetter(letter)"/>');
        inputElement.attr('ng-model', 'guess');
        elem.prepend(inputElement);

        var letterCountElement = angular.element('<p class="cryptogram-letter-count">{{count}}</p>');
        elem.append(letterCountElement);
      }

      if(scope.letter !== ' '){
        elem.addClass('letter-background');
      }

      $compile(elem.contents())(scope);

      scope.setFocusLetter = function(letter){
        cryptogramController.setFocusLetter(letter);
      };
    };

    return {
      require: '?^cryptogram',
      template: '<div class="cryptogram-letter" ng-class="{\'letter-focus\': focus, \'danger\': isError}"></div>',
      replace: true,
      restrict: 'EA',
      scope: {
        letter: "=letter",
        guess: "=guess",
        focus: "=focus",
        isError: "=isError",
        count: "=count"
      },
      compile: function(tElem, tAttrs){
        return link;
      }
    };
  }
})();