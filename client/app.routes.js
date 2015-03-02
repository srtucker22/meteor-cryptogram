angular.module("app").run(['$rootScope', '$state', '$meteor', function($rootScope, $state, $meteor) {

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){ 
    // console.log(event);
    // console.log(toState);
    // console.log(toParams);
    // console.log(fromState);
    // console.log(fromParams);
    console.log(error);

    if(error.status === 401){
      $state.go('401');
    }else{
      $state.go('404');
    }
  });

  $rootScope.tweet = "Meet Cryptobot, the robot that solves cryptograms!";
  $rootScope.facebookUrl = "//cryptograms.meteor.com/";

  $rootScope.$watch('currentUser', function(currentUser, previousState){
    if(currentUser && !$rootScope.subscriptionHandle){
      $meteor.subscribe('my_data').then(function(subscriptionHandle){
        $rootScope.subscriptionHandle = subscriptionHandle;
        $rootScope.$broadcast('currentUser');
      });
    }else if(!currentUser){
      $rootScope.subscriptionHandle = null;
      $rootScope.$broadcast('currentUser');
    }
  });

  $rootScope.logout = function(){
    console.log('logging out');
    if($rootScope.currentUser){
      Meteor.logout(function(error){
        if(error){
          console.log(error);
        }
      });
    }
  };

  $rootScope.loginWithFacebook = function(){
    Meteor.loginWithFacebook({
      requestPermissions: ['public_profile', 'email'],
      loginStyle: 'redirect'
    }, function(error) {
      if(error) {
        console.log(error);
      }else{
        // logic after user logs in
      }
    });
  };

}]);

angular.module("app").config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
  function($urlRouterProvider, $stateProvider, $locationProvider){

    $locationProvider.html5Mode(true);

    $urlRouterProvider.when('/', '/cryptobot');

    $stateProvider
      .state('play', {
        url: '/play',
        templateUrl: 'client/play/play.ng.html',
        controller: 'PlayCtrl',
        controllerAs: 'playctrl'
      })
      .state('cryptobot', {
        url: '/cryptobot',
        templateUrl: 'client/cryptobot/cryptobot.ng.html',
        controller: 'CryptobotCtrl',
        controllerAs: 'cryptobotctrl',
      })
      .state('about', {
        url: '/about',
        templateUrl: 'client/about/about.ng.html',
        controller: 'AboutCtrl',
        controllerAs: 'aboutctrl'
      })
      .state('unauthorized', {
        url: '/401',
        template: "<div class='row'>" + 
                    "<h1 class='col-xs-12 text-center'>401</h1>" +
                    "<h3 class='col-xs-12 text-center text-uppercase'>Unauthorized</h3>" +
                    "<h4 class='col-xs-12 text-center text-uppercase'>Sorry, but you are not authorized to view that page.</h4>" +
                  "</div>",
      })
      .state('404', {
        url: '/404',
        template: "<div class='row'>" + 
                    "<h1 class='col-xs-12 text-center'>404</h1>" +
                    "<h3 class='col-xs-12 text-center text-uppercase'>Page Not Found</h3>" +
                    "<h4 class='col-xs-12 text-center text-uppercase'>Sorry, but the page you were trying to view does not exist.</h4>" +
                  "</div>",
      });

    $urlRouterProvider.otherwise("/play");
  }]);