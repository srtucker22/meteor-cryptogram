(function(){
  angular.module("app").controller("CryptobotCtrl", CryptobotCtrl);

  CryptobotCtrl.$inject = ['$meteor', '$q', '$rootScope', '$scope', '$timeout', 'cryptogramService'];

  function CryptobotCtrl($meteor, $q, $rootScope, $scope, $timeout, cryptogramService){
    var vm = this;
    vm.buildingQuote = "Your cryptogram is complete!\nShare your new shiny cryptogram with the world!";
    vm.createCryptogram = createCryptogram;
    vm.getRandomQuote = getRandomQuote;
    vm.gotQuote = "Quote sourced from my library.\n\nFascinating.";
    vm.needQuote = "I need a quote to perform my duties. I can find a random one if you like.";
    vm.quotes = [
      "Hi, I'm Cryptobot.\nI build and solve cryptograms.\nHow can I serve you?",
      "Cryptograms are encoded messages where letters are substituted for each other.",
      "A cryptogram for 'high five' might be 'qzaq wzej' where 'q' stands for 'h', etc.",
      "You can solve cryptograms in the 'play' section.\nJust press 'play' above.",
      "Learn about my maker and how I work in the 'about' section.\nJust press 'about' above."];
    vm.quoteHeaders = [
      "Beep Boop Bop!",
      "Beep Bop Ding!",
      "Bop Beep Boop!"
    ];
    vm.resetCopyStatus = resetCopyStatus;
    vm.showCopiedMessage = showCopiedMessage;
    vm.totalGuesses = 13;
    vm.solveCryptogram = solveCryptogram;
    vm.solvedQuote = "Cryptogram solution complete.\n\nHow did I do?";
    vm.solvingQuote = "Ooh that's a tough one!\nTurning on thrusters.\nSolving... ";


    activate();

    // activate the controller
    function activate(){

      // set the tooltip status
      resetCopyStatus();

      cycleQuotes();

      $scope.guesses = $meteor.collection(Guesses, false).subscribe('my_guesses');

      $scope.$watchCollection('guess', function(guess){
        if(guess && guess.status && !guess.kill){
          vm.guessCounter += 1;
          vm.currentQuote = (vm.guessCounter >= vm.totalGuesses || guess.status.status === 'final guess') ? vm.solvedQuote: vm.solvingQuote + " " + parseInt(100*vm.guessCounter/vm.totalGuesses).toString() + "% complete";
          vm.result = guess.status.guess;
        }
      });

      vm.currentUser = $rootScope.currentUser;
      $scope.$on('currentUser', function(){
        if($rootScope.currentUser){
          vm.currentUser = $rootScope.currentUser;
        }
      });

      $scope.$on('$destroy', function(){
        killGuess().then(function(){
        }, function(err){
          console.log('err', err);
        });
      });
    }

    // fallback for tooltip
    $scope.fallback = function(copy) {
      window.prompt('Press cmd+c to copy the text below.', copy);
    };

    // randomly change the header for the robot quotebox
    function changeQuoteHeader(){
      vm.currentQuoteHeader = _.sample(vm.quoteHeaders);
    }

    // create a cryptogram from the entered text
    function createCryptogram(){
      vm.cipher = {};
      if(vm.quote){
        killGuess().then(function(){
          $meteor.call('createCryptogram', vm.quote).then(function(result){
            if(result){
              var answer = vm.quote.toLowerCase().slice(0);
              vm.result = result;

              vm.cipher = {};
              _.each(answer, function(val, index){
                if(cryptogramService.isLetter(val))
                  vm.cipher[result[index]] = val;
              });

              changeQuoteHeader();
              vm.currentQuote = vm.buildingQuote;
            }
          }, function(err){
            console.log('err', err);
          });
        }, function(err){
          console.log(err);
        });
      }else{
        vm.currentQuote = vm.needQuote;
      }
    }

    // cycle through cryptobot quotes unless he performs a task
    function cycleQuotes() {
      var i = vm.quotes.indexOf(vm.currentQuote);
      if(!vm.currentQuote || i >= 0){
        vm.currentQuote = i === vm.quotes.length-1? vm.quotes[0]: vm.quotes[i+1];
        changeQuoteHeader();
        $timeout(cycleQuotes, 5000);
      }
    }

    function getRandomQuote() {
      
      killGuess().then(function(success){
      }, function(err){
        console.log('err', err);
      });

      $meteor.call('getRandomQuote').then(function(result){
        vm.quote = result;
        vm.currentQuote = vm.gotQuote;
      }, function(err){
        console.log('err', err);
      });
    }

    function killGuess(){
      if($scope.guess && (!$scope.guess.status || $scope.guess.status.status !== 'final guess')){
        $scope.guess.kill = true;
        return $scope.guess.save();
      }else{
        var defer = $q.defer();
        defer.resolve();
        return defer.promise;
      }
    }

    // change copy tooltip status
    function resetCopyStatus() {
      vm.copyStatus = "Copy to Clipboard";
    }

    // tooltip message change on copy
    function showCopiedMessage() {
      vm.copyStatus = "Copied!\n";
    }

    // solve a cryptogram from the entered text -- currently uses simulated annealing
    function solveCryptogram(){
      if(vm.quote){
        killGuess().then(function(){
          $scope.guesses.save({owner: vm.currentUser._id, puzzle: vm.quote}).then(function(result){
            if(result && result.length === 1){
              vm.guessCounter = 0;
              vm.currentQuote = vm.solvingQuote;
              $scope.guess = $meteor.object(Guesses, result[0]._id, false);
              $meteor.call('simulatedAnnealing', $scope.guess._id).then(function(result){
                // returns the final guess
              }, function(err){
                console.log('err', err);
              });
            }else{
              console.log("a guess wasn't inserted");
            }
          }, function(err){
            console.log("err", err);
          });
        }, function(err){
          console.log('err', err);
        });
      }
    }
  }
})();