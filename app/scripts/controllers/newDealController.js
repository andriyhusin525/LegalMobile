(function() {
  'use strict';
  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('NewDealController', function($scope, $state,$stateParams, $ionicModal, $ionicLoading, $ionicPopup, Restangular, $auth) {    
    $scope.deal = {};
    $scope.deal.deal_type = 'sale';
    Restangular.all('document_types').getList().then(function (resp) {
      $scope.docTypes = []
      resp.forEach(function (doc_type, index) {
        switch($auth.user.roles[0].name){
          case 'client':
            if(doc_type.enable_client_access){
              $scope.docTypes.push(doc_type)
            }
            break;
          case 'realtor':
            if(doc_type.enable_realtor_access){
              $scope.docTypes.push(doc_type)
            }
            break;
          case 'mortgage_agent':
            if(doc_type.enable_mortgage_access){
              $scope.docTypes.push(doc_type)
            }
            break;
          default: 
            $scope.docTypes.push(doc_type)
        }
      })
    })
    $scope.dealNumberPattern = '^\\d{2}[SPRMTsprmt][-]?\\d{4}'
    $scope.handleCreateDealBtnClick = function(formValid) {
      if (formValid){
        if($scope.deal.hasOwnProperty('deal_number')){
          if($scope.deal.deal_number[2].toUpperCase() != _.findWhere($scope.dealTypes, {id: $scope.deal.deal_type_id}).name[0].toUpperCase()){
            $ionicPopup.alert({
              title: 'New Deal',
              template: 'Deal Number and deal type does not match'
            });
            return
          }
        }
        $ionicLoading.show();
        Restangular.all('deals').post($scope.deal).then(function(resp){
          $state.go('tabs.dashboard', {dealTypeId: $scope.dealTypes[0].id});
          $ionicPopup.alert({
            title: 'Deal',
            template: 'Deal Created successfully.'
          });
          $ionicLoading.hide();
        }).catch(function(resp){
          $ionicPopup.alert({
            title: 'Deal',
            template: 'Deal Created successfully.'
          });
          $ionicLoading.hide();
        });
      }else{
        $ionicPopup.alert({
          title: 'New Deal',
          template: 'Please enter valid information'
        });
      }
    };
    $scope.ensureDealNumber = function(isDealNumberValid){
      $scope.numberNotAvailable = false;
      $scope.numberAvailable = false;
      if(isDealNumberValid && $scope.deal.hasOwnProperty('deal_number') && $scope.deal.deal_number != ''){
        Restangular.all('deals').customGET('check_deal_number_availability', {'deal_number' : $scope.deal.deal_number})
        .then(function(resp){
          if(resp.deal_present == 'yes'){
            $scope.numberNotAvailable = true;
          }else{
            $scope.numberAvailable = true;
          }
        });
      }
    };

    $scope.onUpload = onUpload;
    $scope.localUpload = localUpload;

    function localUpload(value){
        if (!value){
            return;
        }
        $ionicLoading.show();
        filepicker.store(
            value,
            onUpload
        );
    }

    function onUpload(data){
        console.log(data)
        $scope.deal.file_url = data.url
        $scope.deal.filename = data.filename
        console.log($scope.deal)
        $ionicLoading.hide();
    }
});
})();
