(function() {
  'use strict';
  
  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('MainController', function($scope, $auth, $state) {
  	$scope.signOut = function(){
  		$auth.signOut().then(function() {
          $state.go('app.home');
      }).catch(function() {
          $state.go('app.home');
      });
  	};

  });
})();
