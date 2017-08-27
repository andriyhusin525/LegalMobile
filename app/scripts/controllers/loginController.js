(function() {
  'use strict';
  function LoginController($ionicPlatform, $scope, $location, $cordovaOauth, $localstorage, $auth, $ionicPopup, $state, $ionicLoading, $rootScope, Restangular, $ionicModal) {
    
    $scope.current_user = {};

    $scope.handleLoginBtnClick = function(formValid) {
      if(formValid){
        $ionicLoading.show();
        $auth.submitLogin($scope.user)
            .then(function(resp) {
              $auth.user.logged_in_to_app = true;
              $auth.user.device_token = $rootScope.deviceToken;
              Restangular.one('users', $auth.user.id).put({
                logged_in_to_app: true,
                device_token: $rootScope.deviceToken
              }).then(function(){});
              $rootScope.setUnreadCount();
              if($auth.user.force_change_password){
                $scope.modal.show();
              }else{
                Restangular.all('consents').get('consents_count').then(function (resp) {
                  if(resp.count != 0){
                    $state.go('app.pending_consents')
                  }
                })
                $rootScope.redirectToDashboard();
              }
              $ionicLoading.hide();
            }).catch(function(resp) {
              $rootScope.invokePopup('Login', 'Invalid Credentials');
              $ionicLoading.hide();
            });
        }else{
          $rootScope.invokePopup('Login', 'Please enter valid login information');          
        }
    };

    // ng-auth-token password change request
    // It sends a post request with email and resdiredt Url to API
    // A mail with link to change password is sent to the user account.
    $scope.handlePwdResetBtnClick = function(formValid) {
      if(formValid){
        $scope.alertPwdInfo = { spinner: true, alert: true };
        $auth.requestPasswordReset($scope.user).then(function() {
          $rootScope.invokePopup('Password Reset Success!', 'An Email with password reset link has been sent to your Email id.');
        }).catch(function(resp) {
          $rootScope.invokePopup('Password Reset', 'Email not found');
        }); 
      }else{
        $rootScope.invokePopup('Password Reset', 'Enter a valid email Address');
      }
    };

    $scope.forgotPassword = function($event) {
      $event.preventDefault();
      $scope.passwordResetForm = {};
      $scope.showForgotPassword = !$scope.showForgotPassword;
    };

    $ionicModal.fromTemplateUrl('password_change.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      
    });

    $scope.$on('modal1.hidden', function() {
      
    });
    // Execute action on remove modal
    $scope.$on('modal1.removed', function() {
      
    });


    $scope.handlePwdUpdate = function(formVaild) {
      if(formVaild){
        $auth.updatePassword($scope.current_user).then(function(resp) {
          $rootScope.invokePopup('Account Update', 'Password updated successfully!');
          $scope.closeModal();
          $auth.user.force_change_password = false;
          Restangular.one('users', $auth.user.id).put($auth.user).then(function(){});
          Restangular.all('consents').get('consents_count').then(function (resp) {
            if(resp.count != 0){
              $state.go('app.pending_consents')
            }
          })
          $rootScope.redirectToDashboard();
        }).catch(function(resp) {
          $rootScope.invokePopup('Account Update', 'Check the information provided');
        });
      }else{
        $rootScope.invokePopup('Account Update', 'Please remove form errors');
      }
    };

  }

  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('LoginController', LoginController);

  LoginController.$inject = ['$ionicPlatform', '$scope', '$location', '$cordovaOauth', '$localstorage', '$auth','$ionicPopup', "$state", "$ionicLoading", "$rootScope", "Restangular", "$ionicModal"];

})();
