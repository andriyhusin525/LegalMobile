(function() {
  'use strict';
  function PendingConsentsController($ionicPlatform, $scope, $ionicLoading, Restangular, $ionicPopup, $rootScope) {
    $scope.consents = Restangular.all('consents/pending_consents').getList().$object;

    $scope.showReason = function (consent_id){
      $scope.selectedConsent = consent_id;
    };

    $scope.allowAccess = function(consent){
      $ionicLoading.show();
      Restangular.one("consents", consent.id).put({'status' : 'accepted'}).then(function(resp){
        Restangular.all('consents/pending_consents').getList().then(function (resp) {
          $scope.consents = resp;
          if($scope.consents.length == 0){
            $rootScope.redirectToDashboard();
          }
        });
        $ionicLoading.hide();
      }).catch(function (resp) {
        console.log(resp)
        $ionicLoading.hide();
      });
    };

    $scope.denyAccess = function (consent) {
      if(consent.reason != null){
        $ionicLoading.show();
        Restangular.one("consents", consent.id).put({'status' : 'denied', 'reason' : consent.reason}).then(function(resp){
          $scope.consents = Restangular.all('consents/pending_consents').getList().$object;
          if($scope.consents.length == 0){
            $rootScope.redirectToDashboard();
          }
          $ionicLoading.hide();
        }).catch(function (resp) {
          console.log(resp)
          $ionicLoading.hide();
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

  LegalMobile.controller('PendingConsentsController', PendingConsentsController);

  PendingConsentsController.$inject = ['$ionicPlatform', '$scope', "$ionicLoading", "Restangular", "$ionicPopup", "$rootScope"];

})();
