(function() {
  'use strict';
  function DealController($scope, $timeout, $state,$stateParams, Restangular, $cordovaFileOpener2, $ionicModal, $ionicPopup, $rootScope, $ionicLoading, $auth) {
    $scope._ = _;
    $scope.id = $stateParams.id;
    $scope.updatePropType = false;
    $scope.updateStatus = false;
    $scope.newTaskForm = false;
    $scope.newCommentForm = false;
    $scope.showAddressForm = false;
    $scope.dealNumberPattern = '^\\d{2}[SPRMTsprmt][-]?\\d{4}'
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
    $scope.new_file = {};
    $scope.stageLabel = {'new_deal': 'New Deal', 'new_title' : 'new_title', 'mortgage_pending' : 'Mortgage Pending', 
                          'closing': 'Closing', 'reporting': 'Reporting', 'requisition': 'Request for Requisition'};

    $scope.updateActivities = function () {
      $scope.deal.customGET('get_activities').then(function (resp) {
        $scope.deal.activities = resp;  
        
      });
    }


    $scope.initialiseDeal = function(){
      Restangular.one('deals', $scope.id).get().then(function (resp) {
        $scope.deal = resp;
        if(!$scope.stages){
          $scope.stages = Restangular.one('deal_types', $scope.deal.deal_type_id).getList('stages').$object;
        }
        Restangular.one('deals', $scope.id).getList('documents')
          .then(function(documents) {
            $scope.deal.documents = documents;
            $scope.documentsToShow = filterDocumentByUserRole(); 
          })
        $scope.deal.comments = Restangular.one('deals', $scope.id).getList('comments').$object;
        Restangular.one('deals', $scope.id).getList('checklists')
          .then(function(checklists){
            $scope.deal.checklists = checklists; 
            $scope.activitiesToShow = filterActivityByUserRole();
          })
      })
    }
    $scope.initialiseDeal();
    
    $scope.displayStageName = function (stage_id) {
      var name;
      $scope.stages.forEach(function (elem, index) {
        if(elem.id == stage_id){
          name = elem.name
        }
      })
      return name;
    };

    $scope.editDealNumber = function(){
      $scope.showDealNumberForm = true;
    }

    function getUserRoles() {
      return $auth.user.roles.reduce(function(userRoles, currRole) {
        userRoles.push(currRole.name);
        return userRoles
      },[]);
    }

    $scope.ensureActivityAccess = function (activity) {
      if(activity.key == 'deal.task-status-updated'){
        var dealTask = _.findWhere($scope.deal.checklists, {task_id: activity.parameters.task_id});
        var status;
        switch($auth.user.roles[0].name){
          case 'client':
            status = dealTask.task.enable_activity_for_client;
            break;
          case 'realtor':
            status = dealTask.task.enable_activity_for_realtor;
            break;
          case 'mortgage_agent':
            status = dealTask.task.enable_activity_for_mortgage;
            break;
          default: 
            status = true;
        }
        return status
      }else{
        return true;
      }
      
    };

    function filterActivityByUserRole() {
      var activitiesWithTask = $scope.deal.activities.reduce(function(activitiesWithTask, currDeal, index){
        if(currDeal.hasOwnProperty('parameters') && currDeal.parameters.hasOwnProperty('task_id'))
          activitiesWithTask.push(currDeal)
        return activitiesWithTask; 
      },[]);

      var userRoles = getUserRoles(); 
      var activitiesToShow = activitiesWithTask.reduce(function(activitiesToShow,currActivity, index ){
        var result =_.findWhere($scope.deal.checklists, {task_id: currActivity.parameters.task_id});
        if(result) {
          if(userRoles.indexOf('super_admin') >= 0)
            activitiesToShow.push(currActivity);
          else if( (userRoles.indexOf('client') >= 0) && _.findWhere($scope.deal.checklists, {'task.enable_activity_for_client': true}) ){
            activitiesToShow.push(currActivity);
          }else if( (userRoles.indexOf('mortgage_agent') >= 0) && _.findWhere($scope.deal.checklists, {'task.enable_activity_for_mortgage': true}) ){
            activitiesToShow.push(currActivity);
          }else if( (userRoles.indexOf('realtor') >= 0) && _.findWhere($scope.deal.checklists, {'task.enable_activity_for_realtor': true}) ){
            activitiesToShow.push(currActivity);
          }
        }
        
        return activitiesToShow;
      },[]); 
      
      console.log('activitiesToShow: ', activitiesToShow); 
      return activitiesToShow;
    }

    function filterDocumentByUserRole() {
      return $scope.deal.documents.reduce(function(documentsToShow, currDoc) {
        var userRoles = getUserRoles(); 
        if(userRoles.indexOf('super_admin') >= 0) {
          documentsToShow.push(currDoc)
        }else if( (userRoles.indexOf('client') >= 0) && currDoc.document_type.enable_client_access) {
          documentsToShow.push(currDoc)
        }else if( (userRoles.indexOf('mortgage_agent') >= 0) && currDoc.document_type.enable_mortgage_access) {
          documentsToShow.push(currDoc)
        }else if( (userRoles.indexOf('realtor') >= 0) && currDoc.document_type.enable_realtor_access) {
          documentsToShow.push(currDoc)
        }
        return documentsToShow; 
      },[]);
    }

    $scope.ensureDealNumber = function(isDealNumberValid){
      $scope.numberNotAvailable = false;
      $scope.numberAvailable = false;
      if(isDealNumberValid && $scope.deal.hasOwnProperty('deal_number') && $scope.deal.deal_number != '' && $scope.deal.deal_number != null){
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

    $scope.updateDeal = function(isFormValid){
      if(isFormValid){
        $ionicLoading.show();
        var editSelectedDeal = Restangular.copy($scope.deal);
        editSelectedDeal.put().then(function(){
          $rootScope.invokePopup('Deal Update', 'Updated successfully');
          $scope.updateStatus = false;
          $scope.updatePropType = false;
          $scope.showAddressForm = false;
          $scope.updateActivities();
        }).catch(function(){
          $rootScope.invokePopup('Deal Update', 'Sorry something went wrong');
        });
        $scope.initialiseDeal();
        $ionicLoading.hide();
      }else{
        $rootScope.invokePopup('Deal Update', 'Enter valid information');
      }
    };

    $scope.editAddress = function(){
      $scope.showAddressForm = true;
    };

    $scope.showUpdateStatus = function() {
      $scope.updateStatus = true;
    };
    $scope.showUpdatepropType = function () {
      $scope.updatePropType = true;
    }

    $scope.showNewDocumentForm = function() {
      $scope.new_file = {};
      $scope.newDocumentForm = true;
    };

    $scope.uploadDocument = function(formValid){
      if(formValid && $scope.new_file.hasOwnProperty("file_url")){
        if($scope.new_file.file_url == ''){
          $rootScope.invokePopup('Document', 'Please pick a document');
          return
        }
        
        $ionicLoading.show();
        $scope.deal.post('documents', $scope.new_file).then(function (resp) {
          $scope.deal.documents = Restangular.one('deals', $scope.id).getList('documents').$object;
          $rootScope.invokePopup('Document', 'Document added successfully!');
          $scope.newDocumentForm = false;
          $ionicLoading.hide();
        }, function (resp) {
          $rootScope.invokePopup('Document', 'Sorry something went wrong');
        });
      }else{
        $rootScope.invokePopup('Document', 'Please select document and type');
      }
    };

    $scope.displayDealStatus = function(status){
      switch(status) {
          case 'new_deal':
              return 'New Deal'
              break;
          case 'new_title':
              return 'Title Search'
              break;
          case 'mortgage_pending':
              return 'Mortgage Pending'
              break;
          case 'requisition':
              return 'Respond to Requisition'
              break;
          case 'closing':
              return 'Closing'
              break;
          case 'reporting':
              return 'Reporting'
              break;
      }
    };

    $scope.displayUserType = function(user_type){
      switch(user_type) {
          case 'client':
              return 'Client'
              break;
          case 'realtor':
              return 'Realtor'
              break;
          case 'mortgage_agent':
              return 'Mortgage Agent'
              break;
      }
    };

    $scope.getActivityMessage = function(activity){
      if(activity.key == 'deal.create'){
       return 'Deal Created'
      }else if(activity.key == 'deal.text-message'){
        return 'Phone ' + activity.parameters.to + '" was sent mesasge ' + activity.parameters.body
      }else if(activity.key == 'deal.add-document'){
        var doc_type = _.findWhere($scope.docTypes, {id: activity.parameters.doc_type_id});
        return 'Document "' + doc_type.name + '" was uploaded ' 
      }else if(activity.key == 'deal.remove-document'){
        return 'Document "' + activity.parameters.name + '" was removed mesasge '
      }else if(activity.key == 'deal.add-comment'){
        return 'Comment "' + activity.parameters.comment + '" was added ' 
      }else if(activity.key == 'deal.remove-comment'){
        return 'Comment "' + activity.parameters.comment + '" was removed '
      }else if(activity.key == 'deal.add-task'){
        return 'Task "' + activity.parameters.name + '" was added '
      }else if(activity.key == 'deal.remove-task'){
        return 'Task "' + activity.parameters.name + '" with status '+ (activity.parameters.status ? '"Completed"' : '"Pending"') +' was removed '
      }else if(activity.key == 'deal.update-task'){
        return 'Task "' + activity.parameters.name + '" with status '+ (activity.parameters.status ? '"Completed"' : '"Pending"') +' was updated '
      }else if(activity.key == 'deal.create-consent'){
        return 'Consent to add "' + activity.parameters.user_type + ' '+ activity.parameters.user_name +'" to deal has been sent to client '
      }else if(activity.key == 'deal.task-status-updated'){
        return 'Task "' + activity.parameters.name + '" was completed by '
      }else{
        if(activity.parameters.changes != {}){
          return Object.keys(activity.parameters.changes) + ' for Deal were Updated'
        }else{
          return 'Deal Updated'
        }
      }
    }

    $scope.ensureDocumentViewAccess = function (doc) {
      switch($auth.user.roles[0].name){
        case 'client':
          return doc.document_type.enable_client_access;
          break;
        case 'realtor':
          return doc.document_type.enable_realtor_access;
          break;
        case 'mortgage_agent':
          return doc.document_type.enable_mortgage_access;
          break;
        default: 
          return true;
      }
    };

    $scope.updateTaskStatus = function(task) {
      $ionicLoading.show();
      $scope.deal.one("checklists", task.id).put(Restangular.stripRestangular(task)).then(function(){
        $scope.deal.checklists = $scope.deal.getList('checklists').$object;
        $scope.updateActivities();
        $rootScope.invokePopup('Deal Update', 'Updated successfully');
      }).catch(function(){
        $rootScope.invokePopup('Deal Update', 'Sorry something went wrong');
      });
      $scope.initialiseDeal();
      $ionicLoading.hide();
    };

    $scope.showNewClientForm = function () {
      $scope.new_user_details = {};
      $scope.clientModal.show();
    };

    $scope.showNewRealtorForm = function () {
      $scope.new_user_details = $scope.deal.realtor ? Restangular.one('users', $scope.deal.realtor.id).get().$object : {} ;
      console.log($scope.deal.realtor)
      $scope.new_user_details.user_form_type = 'realtor';
      $scope.stackHolderModal.show();
    };

    $scope.showNewMortgageAgentForm = function () {
      $scope.new_user_details = $scope.deal.mortgage_agent ? Restangular.one('users', $scope.deal.mortgage_agent.id).get().$object : {} ;
      $scope.new_user_details.user_form_type = 'mortgage_agent';
      $scope.stackHolderModal.show();
    };

    $scope.showNewTaskForm = function(){
      $scope.task = {};
      $scope.newTaskForm = true;
    };

    $scope.handleAddTaskBtnClick = function(){
      if(_.isEmpty($scope.task)){
        $rootScope.invokePopup('Task', 'Task name cant be blank');
      }else{
        $ionicLoading.show();
        $scope.deal.post('tasks', $scope.task).then(function(){
            $scope.deal.tasks = $scope.deal.getList('tasks').$object;
            $scope.newTaskForm = false;
        }).catch(function(){
          $rootScope.invokePopup('Task', 'Sorry something went wrong');
        });
        $ionicLoading.hide();
      }
    };

    $scope.handleEditUserBtnClick = function(formValid){
      if(formValid){
        $ionicLoading.show();
        Restangular.one('deals', $scope.deal.id).post('add_update_user', $scope.new_user_details).then(function(){
          $rootScope.invokePopup('Deal Update', 'Updated successfully');
          $scope.closeModal();
          $scope.initialiseDeal();
        }).catch(function(){
          $rootScope.invokePopup('Deal Update', 'Sorry something went wrong');
        });
        $ionicLoading.hide();
      }else{
        $rootScope.invokePopup('Deal Update', 'Please Provide valid informationg');
      }
    };  

    $scope.AddNewClient = function (formValid) {
      if(formValid){
        $ionicLoading.show();
        Restangular.one('deals', $scope.deal.id).post('add_client', $scope.new_user_details).then(function(){
          $rootScope.invokePopup('Deal Update', 'Updated successfully');
          $scope.closeModal();
          $scope.initialiseDeal();
        }).catch(function(){
          $rootScope.invokePopup('Deal Update', 'Sorry something went wrong');
        });
        $ionicLoading.hide();
      }else{
        $rootScope.invokePopup('Deal Update', 'Please Provide valid informationg');
      }
    }

    $scope.handleDeleteTask = function(task_id) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Task',
        template: 'Are you sure you want to delete this task'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $ionicLoading.show();
          $scope.deal.one("tasks", task_id).remove().then(function(){
            $scope.deal.tasks = $scope.deal.getList('tasks').$object;
          }).catch(function(){
            $rootScope.invokePopup('Task', 'Sorry something went wrong');
          });
          $ionicLoading.hide();
        }
      });
    };

    $scope.handleEditTask = function(task){
        $scope.selectedTaskId = task.id;
        $scope.selectedTask = $scope.deal.one("tasks", task.id).get().$object;
    };

    $scope.handleUpdateTask = function(){
      if(_.isEmpty($scope.task)){
        $rootScope.invokePopup('Task', 'Task name cant be blank');
      }else{
        $ionicLoading.show();
        var editSelectedTask = Restangular.copy($scope.selectedTask);
        editSelectedTask.put().then(function(){
            $scope.deal.tasks = $scope.deal.getList('tasks').$object;
        }).catch(function(){
          $rootScope.invokePopup('Task', 'Sorry something went wrong');
        });
        $scope.selectedTaskId = null;
        $ionicLoading.hide();
      }
    };

    $scope.resetSelection = function () {
      $scope.selectedTaskId = null;
      $scope.NewDocumentForm = false;
      $scope.selectedCommentId = null;
      $scope.showAddressForm = false;
      $scope.showDealNumberForm = false;
    };

    $scope.handleDeleteDocument = function(documnet_id){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Document',
        template: 'Are you sure you want to delete this document'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $ionicLoading.show();
          $scope.deal.one("documents", documnet_id).remove().then(function(){
              $scope.deal.documents = $scope.deal.getList('documents').$object;
          }).catch(function(){
              $rootScope.invokePopup('Document', 'Sorry something went wrong');
          });
          $ionicLoading.hide();
        }
      });
    };

    $scope.showNewCommentForm = function(){
      $scope.comment = {};
      $scope.newCommentForm = true;
    };

    $scope.addComment = function(){
      if(_.isEmpty($scope.comment)){
        $rootScope.invokePopup('Comment', 'Comment cant be blank');
      }else{
        $ionicLoading.show();
        $scope.comment.user_id = $auth.user.id;
        $scope.deal.post('comments', $scope.comment).then(function(){
            $scope.deal.comments = $scope.deal.getList('comments').$object;
            $scope.newCommentForm = false;
        }).catch(function(){
          $rootScope.invokePopup('Comment', 'Sorry something went wrong');
        });
        $ionicLoading.hide();
      }
    };

    $scope.editComment = function(comment){
        $scope.selectedCommentId = comment.id;
        $scope.selectedComment = $scope.deal.one("comments", comment.id).get().$object;
    };

    $scope.updateComment = function(){
      if(_.isEmpty($scope.comment)){
        $rootScope.invokePopup('Comment', 'Comment cant be blank');
      }else{
        $ionicLoading.show();
        var editSelectedComment = Restangular.copy($scope.selectedComment);
        editSelectedComment.put().then(function(){
            $scope.deal.comments = $scope.deal.getList('comments').$object;
        }).catch(function(){
          $rootScope.invokePopup('Comment', 'Sorry something went wrong');
        });
        $scope.selectedCommentId = null;
        $ionicLoading.hide();
      }
    };

    $scope.deleteComment = function(comment_id) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Comment',
        template: 'Are you sure you want to delete this Comment'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $ionicLoading.show();
          $scope.deal.one("comments", comment_id).remove().then(function(){
            $scope.deal.comments = $scope.deal.getList('comments').$object;
          }).catch(function(){
            $rootScope.invokePopup('Comment', 'Sorry something went wrong');
          });
          $ionicLoading.hide();
        }
      });
    };

    $scope.showNewConvoModal = function(){
        $scope.message = {};
        $scope.modal1.show();
    };

    $scope.checkConvoStatus = function(){
      var params = {deal_id: $scope.deal.id}
      Restangular.all('conversations').customGET('check_convo_status', params).then(function(resp){
        $state.go('app.messages', {id: resp.id});
      }).catch(function(resp){
        $scope.showNewConvoModal();
      });
    };

    $scope.startNewConvo = function(message){
      if(message.hasOwnProperty('body') && (message.body != '')){
        var conversation = {
          body: message.body,
          user_id: null,
          deal_id: $scope.deal.id
        }
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
        $scope.new_file.file_url = data.url
        $scope.new_file.filename = data.filename
        $ionicLoading.hide();
    }

    $scope.downloadFile = function (url) {
      window.open(url,"_system");
    }
    

    $ionicModal.fromTemplateUrl('newClient.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.clientModal = modal;
    });

    $ionicModal.fromTemplateUrl('stackHolder.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.stackHolderModal = modal;
    });

    $ionicModal.fromTemplateUrl('newConvo.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal1 = modal;
    });

    $scope.closeModal = function() {
      $scope.stackHolderModal.hide();
      $scope.clientModal.hide();
      $scope.modal1.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.stackHolderModal.remove();
      $scope.clientModal.hide();
      $scope.modal1.remove();
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

  }

  var LegalMobile = angular.module('LegalMobile');

  LegalMobile.controller('DealController', DealController);

  DealController.$inject = ['$scope', '$timeout', '$state','$stateParams', 'Restangular', '$cordovaFileOpener2', '$ionicModal', '$ionicPopup', "$rootScope", '$ionicLoading', '$auth'];

})();
