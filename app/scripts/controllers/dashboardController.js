(function() {
  'use strict';
  function DashboardController($ionicPlatform, $scope, $location, $cordovaOauth, $localstorage, $auth, $http, $ionicLoading, $rootScope, $timeout, Restangular, $stateParams) {
    $scope.hidetabs = true;
    $rootScope.selectedDealTypeId = $stateParams.dealTypeId;
  	$scope.deals = [];
    $scope.noMoreData = false;
    $scope.displayNoMoreData = false;
    $scope.page = 0;
    $scope.selectedDealType = 'purchase';
    $scope.selectedStatusTab = 'all';
    $scope.query = null;
    $scope.searchResult = false;
    var dealsArr = [];
    Restangular.one('deal_types', $stateParams.dealTypeId).all('stages').getList().then(function (resp) {
        $scope.stages = resp;
        $scope.selectedStageId = $scope.stages[0].id;
        $scope.loadMore();
    })
    

    $scope.loadMore = function() {
        $ionicLoading.show();
        $scope.page += 1;
        Restangular.all('deals').customGETLIST('deals_with_deal_type_and_stage', 
            {deal_type_id: $rootScope.selectedDealTypeId, 
            page: $scope.page,
            stage_id: $scope.selectedStageId}).then(function (resp) {
            console.log(resp)
            if(resp.length > 0){
                resp.forEach(function(elem, index) {
                    dealsArr.push(elem);                          
                });
                $timeout(function() {
                    $scope.deals = dealsArr;
                })
                
            } else {
                $scope.noMoreData = true;
                $scope.displayNoMoreData = true;
            }
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.resetSearch = function(){
        $scope.noDealsFound = false;
        $scope.searchResult = false;
        $scope.query = null;
        $scope.deals = [];
        dealsArr = [];
        $scope.noMoreData = false;
        $scope.page = 0;
        $scope.loadMore();
    };

    $scope.changeStage = function(selectedStageId) {
        $scope.selectedStageId = selectedStageId;
        $scope.deals = null;
        dealsArr = [];
        $scope.page = 0;
        $scope.noMoreData = false;
        $scope.displayNoMoreData = false;
        
        $scope.loadMore();
    };

     $scope.displayDealType = function(type){
        switch(type) {
            case 'purchase':
                return 'Purchase'
                break;
            case 'sale':
                return 'Sale'
                break;
            case 'refinance':
                return 'Refinance'
                break;
        }
    };
    $scope.searchDeals = function(query){
        $scope.displayNoMoreData = false;
        $scope.noMoreData = true;
        $scope.searchResult = true;
        $ionicLoading.show();
        $scope.deals = [];
        $scope.noDealsFound = false;
        $scope.page = 0;
        $scope.selectedDealType = 'purchase';        
        $http({
            method: 'GET',
            params: { query: query,
                      deal_type_id: $scope.selectedDealTypeId },
            url: $rootScope.baseUrl + '/deals/mobile_search'
            }).then( function(resp){ 
                if(resp.data.length == 0){
                    $scope.noDealsFound = true;
                }else{
                    resp.data.forEach(function(elem, index) {
                        $scope.deals.push(elem);
                    });
                }
            });
        $ionicLoading.hide();
    };
    $rootScope.setUnreadCount();
  }

  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('DashboardController', DashboardController);

  DashboardController.$inject = ['$ionicPlatform', '$scope', '$location', '$cordovaOauth', '$localstorage', '$auth','$http', "$ionicLoading", "$rootScope", "$timeout", "Restangular", "$stateParams"];

})();
