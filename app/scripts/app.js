(function() {
  'use strict';
  var LegalMobile = angular.module('LegalMobile', [
    'ionic',                   // ionic framework.
    'ngCordova',               // AngularJS Cordova wrappers for common Cordova plugins.
    'ngResource',              // ngResource module provides interaction support with RESTful services via the $resource service.
    'ngCookies',               // ngCookies module provides a convenient wrapper for reading and writing browser cookies.
    'ngMessages',              // ngMessages is a directive that is designed to show and hide messages based on the state of a key/value object that it listens on.
    'pascalprecht.translate',   // angular-translate module for i18n and l10n lazy loading and pluralization
    'ng-token-auth',
    'restangular',
    'angular-filepicker',
    'angular.filter',
    'ionic-ratings',
    'angularMoment',
    'luegg.directives',
    'btford.socket-io'
  ]);

  LegalMobile.config(function( $authProvider, RestangularProvider,  $ionicConfigProvider, filepickerProvider) {

    // var baseUrl = 'http://legal-api-staging.bitbakeryapps.in'
    // var baseUrl = 'http://legal-api-test.bitbakeryapps.in'
    // var baseUrl = 'http://localhost:3000'
    // var baseUrl = 'http://09ac3c83.ngrok.io'
    // var baseUrl = 'http://production-api.legalapp.bitbakeryapps.in';
    var baseUrl = 'http://production-api.real-estate.bitbakeryapps.in';
    $ionicConfigProvider.navBar.alignTitle('center');

    $ionicConfigProvider.tabs.position('bottom');

    $authProvider.configure({
      apiUrl: baseUrl,
      confirmationSuccessUrl: 'http://production-web.real-estate.bitbakeryapps.in' +'/account-create-success',
      storage: 'localStorage',
      passwordResetSuccessUrl: 'http://production-web.real-estate.bitbakeryapps.in' + '/password/change'
    });

      RestangularProvider.setBaseUrl(baseUrl);
      filepickerProvider.setKey('ABPeNR911RyOjRv5gYMPGz');
  });


  LegalMobile.run(function($rootScope, $ionicPlatform, $ionicLoading, $cordovaSplashscreen, $auth, $state, $location, $ionicPopup, Restangular, socket) {
    $rootScope.baseUrl = 'http://production-api.real-estate.bitbakeryapps.in';
    $rootScope.redirectToDashboard = function(){
      if($auth.user.roles[0].name == 'client'){
        $state.go('app.client_dashboard');
      }else{
        $state.go('tabs.dashboard', {dealTypeId: $rootScope.dealTypes[0].id});
      }
     }
    $rootScope.$on('auth:validation-success', function(ev) {
      $rootScope.setUnreadCount();
    });

    $ionicPlatform.ready(function() {
      if (!$auth.user.signedIn) {
          $state.go('app.login');
      } else {
        $rootScope.redirectToDashboard();
      }

      if (window.navigator && window.navigator.splashscreen) {
        $cordovaSplashscreen.hide();
      }

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }

      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
      }      

      var push = PushNotification.init({
          android: {
              senderID: "727698686700",
              "icon": "icon"
          }
      });
      push.on('registration', function(data) {
        $rootScope.deviceToken = data.registrationId;
      });

    });

    $rootScope.invokePopup = function (title, template) {
      $ionicPopup.alert({ title: title, template: template });
    };

    $rootScope.$on('loading:show', function() {
      $ionicLoading.show(
        {
          content: '',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 300,
          showDelay: 120
        }
      );
    });

    $rootScope.$on('loading:hide', function() {
      $ionicLoading.hide();
    });
    $rootScope.rolesPermissions = Restangular.all('roles').getList().$object;

    var ensureAccess = function(user, type){
      var userRole = user.roles[0];
      var role = _.where($rootScope.rolesPermissions, userRole)[0];
      var permission = _.where(role.permissions, {name: type})
      return (permission.length > 0 ? true : false)
    }
    $rootScope.ensureUpdateDealsAccess = function(user){
      return ensureAccess(user, 'update_deal')
    };
    $rootScope.ensureAllMessagesAccess = function(user){
      return ensureAccess(user, 'all_message')
    };
    $rootScope.ensureMessagePeopleAccess = function(user){
      return ensureAccess(user, 'message_people')
    };
    $rootScope.ensureManagePeopleAccess = function(user){
      return ensureAccess(user, 'manage_people')
    };
    $rootScope.ensureCreateDealAccess = function(user){
      return ensureAccess(user, 'create_deal')
    };
    $rootScope.ensureDeleteCommentAccess = function(user){
      return ensureAccess(user, 'delete_comment')
    };
    $rootScope.ensureSendTextAccess = function(user){
      return ensureAccess(user, 'send_text_message')
    };
    $rootScope.ensureLegalFirmUser = function(user){
      return ['super_admin', 'power_user', 'admin', 'user'].indexOf(user.roles[0].name) > -1
    };
    $rootScope.ensureNonLegalFirmUser = function(user){
      return ['super_admin', 'power_user', 'admin', 'user'].indexOf(user.roles[0].name) == -1
    };

    $rootScope.dealTypes = Restangular.all('deal_types').getList().$object;

    $rootScope.setUnreadCount = function () {
      Restangular.all('conversations').customGET('unread_count').then(function (resp) {
        $rootScope.unreadMessageCount = resp;
      });
      socket.socket.emit('unreadCount', {user_id: $auth.user.id});
      socket.socket.on('unreadCount' + $auth.user.id, function(unread_count){
        $rootScope.unreadMessageCount = unread_count;
      });
    }

  });
})();
