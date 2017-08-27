(function() {
  'use strict';
  function SignUpController($ionicPlatform, $scope, $location, $cordovaOauth, $localstorage, $auth, $state) {

    $scope.user = {};

    // ng-auth-token sign_up auth
       // sends a post request to Auth API and register new user
      $scope.handleRegBtnClick = function(){
        $auth.submitRegistration($scope.user).then( function(resp) {
          $state.go('app.login');
        }).catch( function(resp) {
          
        });
      };

  }

  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('SignUpController', SignUpController);

  SignUpController.$inject = ['$ionicPlatform', '$scope', '$location', '$cordovaOauth', '$localstorage', '$auth', '$state'];

})();
