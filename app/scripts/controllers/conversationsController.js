(function() {
  'use strict';
  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('ConversationsController', function($scope, $state,$stateParams, $ionicModal, $ionicLoading, $ionicPopup, Restangular, $rootScope, $auth, $timeout, socket) {
    $scope.moment = moment;
    $scope.noConversations = false;

    $scope.chatInit = function () {
      Restangular.all("conversations").getList().then(function(resp) {
        $scope.conversations = resp;
        socket.socket.on('conversationList' + $auth.user.id, function(convoList){
          $scope.conversations = convoList;
        });
        if($scope.conversations.length == 0){
          $scope.noConversations = true;
        }  
      }).catch(function(resp){
      });
    }

    $scope.chatInit();

  	$scope.showNewConvoModal = function(){
  		$scope.message = {};
      $scope.modal.show();
    };

    $scope.startNewConvo = function(message){
    	if(message.hasOwnProperty('body') && (message.body != '')){
  			var conversation = { body: message.body, user_id: null }
  			Restangular.all('conversations').post(conversation).then(function(resp){
  				$scope.closeModal();
  				$state.go('app.messages', {id: resp.id})
  			}).catch(function(){
  				alert('Sorry something went wrong');
  			});
  		}else{
  			alert('Message cant be blank');
  		}
    };

    $ionicModal.fromTemplateUrl('newConvo.html', {
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


});
})();
