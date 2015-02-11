(function(){
  angular.module("app").controller("DashboardCtrl", DashboardCtrl);

  DashboardCtrl.$inject = ['$meteorMethods', '$rootScope', '$scope', 'cryptogramService', 'matchmedia'];

  function DashboardCtrl($meteorMethods, $rootScope, $scope, cryptogramService, matchmedia){
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
      $scope.$on('currentUser', function(){
        if($rootScope.currentUser){
          vm.currentUser = $rootScope.currentUser;
        }
      });

      $scope.$watch('data', function(data){
        if(vm.currentUser)
          Meteor.users.update({_id: vm.currentUser._id}, {$set: {'cryptograms.current.solution': $scope.data.currentSolution}});
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
      $meteorMethods.call("getCryptogram").then(function(result){
        vm.answer = false;
        vm.solved = false;

        if(vm.currentUser && vm.currentUser.cryptograms && vm.currentUser.cryptograms.current && vm.currentUser.cryptograms.current.cryptogram === result._id){
          console.log('current', vm.currentUser.cryptograms.current.solution);
          $scope.data.currentSolution = vm.currentUser.cryptograms.current.solution;
        }else{
          $scope.data.currentSolution = null;
        }

        vm.cryptogram = result;
      }, function(err){
        console.log(err);
      });
    }  

    function getHint(){
      $meteorMethods.call("getHint", vm.cryptogram._id, $scope.data.currentSolution).then(function(hint){
        if(hint){
          $scope.$broadcast('hint', hint);
        }
      }, function(err){
        console.log(err);
      });
    }

    function giveUp(){
      $meteorMethods.call("giveUp", vm.cryptogram._id).then(function(result){
        vm.answer = true;
        $scope.$broadcast("answer", result);
      },function(err){
        console.log(err);
      });
    }

    function submit(){
      $meteorMethods.call("checkSolution", vm.cryptogram._id, $scope.data.currentSolution).then(function(result){
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