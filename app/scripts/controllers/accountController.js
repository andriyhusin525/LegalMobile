(function() {
  'use strict';
  function AccountController($ionicPlatform, $scope, $location, $cordovaOauth, $localstorage, $auth, $ionicPopup, $state, $rootScope) {
    $scope.new_user = $scope.user;
    $scope.current_user = {};
    $scope.handleUpdateAccountBtnClick = function(formVaild) {
      if(formVaild){
        $auth.updateAccount($scope.new_user).then(function(resp) {
          $rootScope.invokePopup('Account Update', 'Account details were updated successfully!');
          $rootScope.redirectToDashboard();
        }).catch(function(resp) {
          $rootScope.invokePopup('Account Update', 'Sorry something went wrong.');
        });
      }else{
        $rootScope.invokePopup('Account Update', 'Please Provide valid information');
      }
    };

    $scope.handlePwdUpdate = function(formVaild) {
      if(formVaild){
        $auth.updatePassword($scope.current_user).then(function(resp) {
          $rootScope.invokePopup('Account Update', 'Password updated successfully!');
          $rootScope.redirectToDashboard();
        }).catch(function(resp) {
          $rootScope.invokePopup('Account Update', 'Check the information provided');
        });
      }else{
        $rootScope.invokePopup('Account Update', 'Please Provide valid information');
      }
    };
  }

  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('AccountController', AccountController);

  AccountController.$inject = ['$ionicPlatform', '$scope', '$location', '$cordovaOauth', '$localstorage', '$auth','$ionicPopup', "$state", "$rootScope"];

})();
