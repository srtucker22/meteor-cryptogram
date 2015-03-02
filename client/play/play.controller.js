(function(){
  angular.module("app").controller("PlayCtrl", PlayCtrl);

  PlayCtrl.$inject = ['$meteor', '$rootScope', '$scope', 'matchmedia'];

  function PlayCtrl($meteor, $rootScope, $scope, matchmedia){
    var vm = this;

    vm.getCryptogram = getCryptogram;
    vm.getHint = getHint;
    vm.giveUp = giveUp;
    vm.submit = submit;
    $scope.data = {
      currentSolution: '',
    };
    
    activate();

    function activate(){
      $scope.$watch('data', function(data){
        if($rootScope.currentUser)
          Meteor.users.update({_id: $rootScope.currentUser._id}, {$set: {'cryptograms.current.solution': $scope.data.currentSolution}});
      }, true);

      matchmedia.onPhone(function(mediaQueryList){
        if(mediaQueryList.matches){
          $scope.data.maxLineChars = 16;
        }
      });

      matchmedia.onDesktop(function(mediaQueryList){
        if(mediaQueryList.matches)
          $scope.data.maxLineChars = 20;
      });
    }

    function getCryptogram(){
      vm.cryptogram = null;
      $meteor.call("getCryptogram").then(function(result){
        vm.answer = false;
        vm.solved = false;

        if($rootScope.currentUser && $rootScope.currentUser.cryptograms && $rootScope.currentUser.cryptograms.current && $rootScope.currentUser.cryptograms.current.cryptogram === result._id){
          $scope.data.currentSolution = $rootScope.currentUser.cryptograms.current.solution;
        }else{
          $scope.data.currentSolution = null;
        }

        vm.cryptogram = result;
      }, function(err){
        console.log(err);
      });
    }  

    function getHint(){
      $meteor.call("getHint", vm.cryptogram._id, $scope.data.currentSolution).then(function(hint){
        if(hint){
          $scope.$broadcast('hint', hint);
        }
      }, function(err){
        console.log(err);
      });
    }

    function giveUp(){
      $meteor.call("giveUp", vm.cryptogram._id).then(function(result){
        vm.answer = true;
        $scope.$broadcast("answer", result);
      },function(err){
        console.log(err);
      });
    }

    function submit(){
      $meteor.call("checkSolution", vm.cryptogram._id, $scope.data.currentSolution).then(function(result){
        if(result){
          vm.answer = true;
          vm.solved = true;
        }
      },function(err){
        console.log(err);
      });
    }
  }
})();