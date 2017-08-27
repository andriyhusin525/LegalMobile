(function () {
  'use strict';
  /**
  * @ngdoc constant
  * @name LegalMobile.ROUTES
  * @description
  * # ROUTES
  * Defines UI-Router states and their associated URL routes and views.
  * Is used inside /services/ApiService.js to generate correct endpoint dynamically
  */

  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.config(function($httpProvider, $stateProvider, $urlRouterProvider,$ionicConfigProvider) {

    // Turn off caching (Please add $ionicConfigProvider to the app.config options)
    // $ionicConfigProvider.views.maxCache(0);

    // Turn off back button text
    $ionicConfigProvider.backButton.previousTitleText(false).text('');

    // Application routing
    $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/main.html',
      controller: 'MainController'
    })
    .state('app.intro', {
      url: '/intro',
      views: {
        'menuContent': {
          templateUrl: 'templates/views/intro.html',
          controller: 'IntroController'
        }
      }
    })
    .state('app.home', {
      url: '/home',
      cache: true,
      views: {
        'viewContent': {
          templateUrl: 'templates/views/home.html',
          controller: 'HomeController'
        }
      }
   })
    .state('app.account', {
      url: '/account',
      cache: true,
      views: {
        'viewContent': {
          templateUrl: 'templates/views/account.html',
          controller: 'AccountController'
        }
      }
   })
    .state('app.feedback', {
      url: '/feedback',
      cache: true,
      views: {
        'viewContent': {
          templateUrl: 'templates/views/feedback.html',
          controller: 'FeedbackController'
        }
      }
   })
    .state('app.password_change', {
      url: '/password/change',
      cache: false,
      views: {
        'viewContent': {
          templateUrl: 'templates/views/password_change.html',
          controller: 'AccountController'
        }
      }
   })
    .state('app.deal',{
      url:'/deal/:id',
      cache: false,
      views: {
        'viewContent': {
          templateUrl:'templates/views/deal.html',
          controller:'DealController'
        }
      }
    })
    .state('app.new_deal',{
      url:'/deal/new',
      views: {
        'viewContent': {
          templateUrl:'templates/views/new_deal.html',
          controller:'NewDealController'
        }
      }
    })
    
    .state('app.signup',{
      url:'/signup',
      views: {
        'viewContent': {
          templateUrl:'templates/views/signup.html',
          controller:'SignUpController'
        }
      }
    })

    .state('app.login',{
      url:'/login',
      views: {
        'viewContent': {
          templateUrl:'templates/views/login.html',
          controller:'LoginController'
        }
      }
    })

    .state('app.settings', {
      url: '/settings',
      cache: false,
      views: {
        'viewContent': {
          templateUrl: 'templates/views/settings.html',
          controller: 'SettingsController'
        }
      }
    })
    .state('app.conversations', {
      url: '/conversations',
      cache: false,
      views: {
        'viewContent': {
          templateUrl: 'templates/views/conversations.html',
          controller: 'ConversationsController'
        }
      }
    })
    .state('app.messages', {
      url: '/messages/:id',
      cache: false,
      views: {
        'viewContent': {
          templateUrl: 'templates/views/messages.html',
          controller: 'MessagesController'
        }
      }
    })
    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/views/home-tabs.html',
      controller: 'TabsController'
    })
    .state('tabs.dashboard', {
      url: '/dashboard/:dealTypeId',
      cache: false,
      views: {
        'dashboard-tab': {
          templateUrl: 'templates/views/dashboard.html',
          controller: 'DashboardController'
        }
      }
    })
    .state('tabs.sale_dashboard', {
      url: '/sale_dashboard',
      cache: false,
      views: {
        'sale-tab': {
          templateUrl: 'templates/views/sale_dashboard.html',
          controller: 'SaleDashboardController'
        }
      }
    })
    .state('app.client_dashboard', {
      url: '/client_dashboard',
      cache: false,
      views: {
        'viewContent': {
          templateUrl: 'templates/views/client_dashboard.html',
          controller: 'ClientDashboardController'
        }
      }
    })
    .state('tabs.refinance_dashboard', {
      url: '/refinance_dashboard',
      cache: false,
      views: {
        'refinance-tab': {
          templateUrl: 'templates/views/refinance_dashboard.html',
          controller: 'RefinanceDashboardController'
        }
      }
    })
    .state('app.consents', {
      url: '/consents',
      cache: false,
      views: {
        'viewContent': {
          templateUrl: 'templates/views/consents.html',
          controller: 'ConsentsController'
        }
      }
    })
    .state('app.pending_consents', {
      url: '/pending_consents',
      cache: false,
      views: {
        'viewContent': {
          templateUrl: 'templates/views/pending_consents.html',
          controller: 'PendingConsentsController'
        }
      }
    });


    // if none of the above states are matched, use this as the fallback
    if (window.localStorage.firstTime === 'true') {
      // redirects to default route for undefined routes
      $urlRouterProvider.otherwise('/app/home');
    } else {
      $urlRouterProvider.otherwise('/');
    }
  });


})();
