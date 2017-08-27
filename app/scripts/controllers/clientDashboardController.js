(function() {
  'use strict';
  function ClientDashboardController($ionicPlatform, $scope, $ionicLoading, Restangular) {
  	$scope.deals = Restangular.all('deals').customGETLIST('client_deals').$object;
    
  }

  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('ClientDashboardController', ClientDashboardController);

  ClientDashboardController.$inject = ['$ionicPlatform', '$scope', "$ionicLoading", "Restangular"];

})();
