(function() {
  'use strict';
  function ConsentsController($ionicPlatform, $scope, $ionicLoading, Restangular, $ionicPopup) {
    $scope.consents = Restangular.all('consents').getList().$object;


    $scope.toTitleCase = function (str) {
	    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}

    $scope.showReason = function (consent_id){
    	$scope.selectedConsent = consent_id;
    };

    $scope.allowAccess = function(consent){
      $ionicLoading.show();
    	consent.status = 'accepted';
      consent.reason = null;
    	consent.put().then(function(resp){
    		$scope.consents = Restangular.all('consents').getList().$object;
        $ionicLoading.hide();
    	}).catch(function (resp) {
        $ionicLoading.hide();
    		console.log(resp)
    	});
    };

    $scope.denyAccess = function (consent) {
    	if(consent.reason != null){
        $ionicLoading.show();
    		consent.status = 'denied';
	    	consent.put().then(function(resp){
	    		$scope.consents = Restangular.all('consents').getList().$object;
          $scope.selectedConsent = null;
          $ionicLoading.hide();
	    	}).catch(function (resp) {
          $ionicLoading.hide();
	    		console.log(resp)
	    	});
    	}else{
    		$ionicPopup.alert({
		     title: 'Deny User',
		     template: 'Please give a reason for denial'
		   });
    	}
    };
  }

  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('ConsentsController', ConsentsController);

  ConsentsController.$inject = ['$ionicPlatform', '$scope', "$ionicLoading", "Restangular", "$ionicPopup"];

})();
