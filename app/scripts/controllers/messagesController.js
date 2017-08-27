(function() {
  'use strict';
  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('MessagesController', function($scope, $state,$stateParams, $ionicModal, $ionicLoading, $ionicPopup, Restangular, $rootScope, $auth, $timeout, $window, $ionicScrollDelegate, socket) {

  	$scope.id = $stateParams.id;
    $scope.newMessage = {};
  	$scope.moment = moment;
    $scope.selectedConvoId = $scope.id;

    $scope.getChat = function(){
      Restangular.one('conversations', $stateParams.id).all('messages').getList().then(function (resp) {
        socket.socket.emit('conversation', {convo_id: $stateParams.id});
        socket.socket.on('conversation'+$stateParams.id, function(convo){
          $scope.conversation = convo;
          $ionicScrollDelegate.scrollBottom();
        });
        $ionicScrollDelegate.scrollBottom();
        $scope.conversation = resp;
      });
      $scope.selectedConvoDetails = Restangular.one('conversations', $scope.id).get().$object;
    }

    $scope.getChat();
    
    $scope.newMessage = {}; 
    $scope.getTitle = function(){
  		if ($scope.selectedConvoDetails.deal != null){
  			return $scope.selectedConvoDetails.deal.property_address;
  		}else{
  			var str='';
  			angular.forEach($scope.selectedConvoDetails.users, function(user, index) {
  				str = str + ' ' + user.first_name;
  			});
  			return str;
  		}
  	};

    $scope.addMessage = function(){
      if($scope.newMessage.hasOwnProperty('body') && ($scope.newMessage.body != '')){
        Restangular.one('conversations', $scope.selectedConvoId).post('messages', $scope.newMessage);
        $ionicScrollDelegate.scrollBottom();
        $scope.newMessage = {};
      }else{
        alert('message cant be blank');
      }
    };

  });
})();
