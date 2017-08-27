(function() {
  'use strict';
  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('TranslateController', ['$translate', '$scope', function ($translate, $scope) {
    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey);
    };
  }]);
})();
