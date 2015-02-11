(function(){
  angular.module("app").directive('cryptogram', cryptogramDirective);

  cryptogramDirective.$inject = ['$compile', 'cryptogramService'];

  function cryptogramDirective($compile, cryptogramService) {
    this.link = function(scope, element, attrs) {
      scope.settings = {};
      scope.code = {};
      scope.letterIndexMap = cryptogramService.getLetterIndexMap(scope.puzzle);

      if(scope.solution){
        _.each(scope.solution, function(c, index){
          if(cryptogramService.isLetter(c)){
            scope.code[scope.puzzle[index]] = c;
          }
        });
      }

      scope.$watch('puzzle', function(puzzle){
        refreshView(puzzle);
      });

      attrs.$observe('maxLineChars', function(maxLineChars){
        scope.maxLineChars = maxLineChars;
        scope.letterWidth = Math.floor(100/scope.maxLineChars);
        refreshView(scope.puzzle);
        scope.settings.recompileBool = true;
      });

      scope.$on('hint', function(event, hint){
        scope.code[scope.puzzle[hint.index]] = hint.letter;
      });

      scope.$on('answer', function(event, answer){
        _.each(answer, function(c, index){
          if(cryptogramService.isLetter(c)){
            scope.code[scope.puzzle[index]] = c;
          }
        });
      });

      scope.remainingLetters = function(){
        return _.difference('abcdefghijklmnopqrstuvwxyz', _.values(scope.code)).join(' ');
      };

      // update the solution, look for invalid characters when the model changes
      scope.$watchCollection('code', function(code){
        scope.solution = updateSolution(code);
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

      function updateSolution(code){
        return _.map(scope.puzzle, function(c){
          return code[c]? code[c]: (cryptogramService.isLetter(c)? ' ': c);
        }).join("");
      }
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
        solution: "=solution"
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

  angular.module('app').directive('recompile', recompileDirective);

  recompileDirective.$inject = ['$compile', '$parse'];

  function recompileDirective($compile, $parse) {
    'use strict';
   
    return {
      scope: true, // required to be able to clear watchers safely
      compile: function(el) {
        var template = el.html();
        return function link(scope, $el, attrs) {
          scope.$parent.$watch(attrs.recompile, function(_new, _old) {
            var useBoolean = attrs.hasOwnProperty('useBoolean');
            if ((useBoolean && (!_new || _new === 'false')) || (!useBoolean && (!_new || _new === _old))) {
              return;
            }

            // remove all watchers because the recompiled version will set them up again.
            removeChildrenWatchers($el);
            // reset Recompile to false if we're using a boolean
            if (useBoolean) {
              $parse(attrs.recompile).assign(scope.$parent, false);
            }
   
            // recompile
            var newEl = $compile(template)(scope.$parent.$new());
            $el.html(newEl);
          });
        };
      }
    };
   
    function removeChildrenWatchers(element) {
      angular.forEach(element.children(), function(childElement) {
        removeAllWatchers(angular.element(childElement));
      });
    }
   
    function removeAllWatchers(element) {
      if (element.data().hasOwnProperty('$scope')) {
        element.data().$scope.$$watchers = [];
      }
      removeChildrenWatchers(element);
    }
  }
})();