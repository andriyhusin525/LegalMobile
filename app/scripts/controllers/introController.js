(function() {
  'use strict';
  function IntroController($ionicPlatform, $scope, $state, $localstorage, $ionicSlideBoxDelegate, IntroSlideService) {

    $scope.startApp = function () {
      $state.go('app.home');
      $localstorage.set('firstTime', 'true');
    };

    $scope.next = function () {
      $ionicSlideBoxDelegate.next();
    };

    $scope.previous = function () {
      $ionicSlideBoxDelegate.previous();
    };

    $scope.disableSwipe = function() {
      $ionicSlideBoxDelegate.enableSlide(false);
    };

    // Called each time the slide changes
    $scope.slideChanged = function (index) {
      $scope.slideIndex = index;
    };

    $scope.currentSlide = IntroSlideService.index;

  }



  var LegalMobile = angular.module('LegalMobile');
  LegalMobile.factory('IntroSlideService', function () {
    var service = {};
    service.index = 0;
    return service;
  });
  LegalMobile.controller('IntroController', IntroController);

  IntroController.$inject = ['$ionicPlatform', '$scope', '$state', '$localstorage', '$ionicSlideBoxDelegate', 'IntroSlideService'];



})();
