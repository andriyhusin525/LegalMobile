(function() {
  'use strict';
  function FeedbackController($ionicPlatform, $scope, $state, $rootScope, Restangular, $ionicLoading) {
    $scope.ratingsObject = {
        iconOn : 'ion-ios-star',
        iconOff : 'ion-ios-star-outline',
        iconOnColor: 'rgb(200, 200, 100)',
        iconOffColor:  'rgb(200, 100, 100)',
        rating: 0,
        callback: function(rating) {
          $scope.ratingsCallback(rating);
        }
      };

      $scope.ratingsCallback = function(rating) {
        $scope.feedback.rating = rating;
      };

      $scope.feedback = {feedback_type: 'mobile'};
      $scope.formErrors = false;
      $scope.submitFeedback = function(){
        if($scope.feedback.hasOwnProperty("summary") && $scope.feedback.hasOwnProperty("rating")) {
          $scope.formErrors = false;
          $ionicLoading.show();
          Restangular.all('feedbacks').post($scope.feedback).then(function () {
            $rootScope.invokePopup('Feedback', 'Feedback submitted successfully');
            $rootScope.redirectToDashboard();
          }).catch(function(){
            $rootScope.invokePopup('Feedback', 'something went wrong');
          });
          $ionicLoading.hide();
        }else{
          $scope.formErrors = true;
        }
      };
  }

  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('FeedbackController', FeedbackController);

  FeedbackController.$inject = ['$ionicPlatform', '$scope', "$state", "$rootScope", 'Restangular', '$ionicLoading'];

})();
