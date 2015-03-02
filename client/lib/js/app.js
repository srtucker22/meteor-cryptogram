(function(){
  angular.module("app", ["angular-meteor", "ui.router", "ui.bootstrap", "matchmedia-ng", "ngClipboard", "angulike"]);

  angular.module("app").config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setConfig({
      hoverClass:"btn-clipboard-hover"
    });
  }]);

  angular.module("app").run([
    '$rootScope', function ($rootScope) {
      $rootScope.facebookAppId = '361858377222770'; // set your facebook app id here
    }
  ]);
})();