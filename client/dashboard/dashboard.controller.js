(function(){
  angular.module("app").controller("DashboardCtrl", DashboardCtrl);

  DashboardCtrl.$inject = ['cryptogramService'];

  function DashboardCtrl(cryptogramService){
    var vm = this;
    vm.getCryptogram = getCryptogram;
    vm.giveUp = giveUp;
  
    function getCryptogram(){
      vm.cryptogram = cryptogramService.createCryptogram("'the quick brown fox jumped over the lazy dog and then someone's shit fell 'yall.\n then something else happened! what?! i know...' \n-Simon Tucker");
    }  

    function giveUp(){
      vm.cryptogram = null;
    }
  }
})();