angular.module('uploadGroupsController', ['moodleData', 'localStorage'])
  .controller('UploadGroupsCtrl', function($scope, $state, $moodleData, $localStorage, $ionicLoading, $ionicPopup, $ionicActionSheet,$offlineData){

    $scope.$on('$ionicView.beforeEnter', function() {
      // authorize
      $moodleData.authorize();
    });

    $scope.layout='group';

    $scope.$on('$ionicView.afterEnter', function() {
      fetchData();
    });

    $scope.showLoader = function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="spiral"></ion-spinner><br>Working...'
      });
    };

    $scope.hideLoader = function(){
      $ionicLoading.hide();
    };

    $scope.removeGroup = function(group){
      var groups = $localStorage.getObject('offlineGroups');
      groups.splice(group.id, 1);
      // reindex the users array
      angular.forEach(groups, function(v, k){
        groups[k].id = k;
      });
      // store the updated users array
      $localStorage.setObject('offlineGroups', groups);
    };

    $scope.newGroup = function(group){
      group.status=0;
      var groups = $localStorage.getObject('offlineGroups');
      groups.splice(group.id, 1,group);
      // store the updated users array
      $localStorage.setObject('offlineGroups', groups);
    };

    $scope.delete = function(group){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Group',
        template: 'Are you sure you want permanently remove this Group?'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $scope.removeGroup(group);
          fetchData();
        }
      });
    };

    $scope.uploadActions = function(group) {
      var text='';
      switch(group.status){
        case 1:
          text='New Group';
          break;
        case 2:
          text='Edit Group';
          break;
        case 3:
          text='Delete Group';
          break;
      }
      // Show the action sheet
      var uploadSheet = $ionicActionSheet.show({
        buttons: [
          { text: text}
        ],
        titleText: "Actions for " + group.group_name,
        cancelText: 'Cancel',
        buttonClicked: function(index) {
          $scope.uploadGroup(group);
          return true;
        }
      });
    };
    
    $scope.uploadGroup = function(group){
      $scope.showLoader();
      var groupid = group.id;
      //edit user
      if(group.status == 2){
        // set id to existing user's id for update
        $offlineData.add_gusers(group.gid,group.group_name,group.users,function(){
          fetchEditData(group);
        });
      }
      // new user
      if(group.status == 1){
        $offlineData.add_group(group.group_name,function(re){
            group.gid=re[0].group_id;
            $scope.newGroup(group);
            fetchData();
        });
      }

      //delete user
      if(group.status == 3){
        $offlineData.delete_group(group.gid,function(re){
          $scope.removeGroup(group);
          fetchData();
        });
      }
      $scope.hideLoader();
    };

    $scope.group_user=function(group,user){

    };



    $scope.doRefresh = function(){
      fetchData();
    };

    $scope.myFilter=function(group){
      return group.status!==0;
    };

    function fetchData(){
      $scope.showLoader();
      checkExistingUsers(function(){
        $scope.hideLoader();
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    function checkExistingUsers(callback){
      $scope.groups = $localStorage.getObject('offlineGroups');
      var length=0;
      angular.forEach($scope.groups, function(group, i){
        if(group.status!=0){
          length++;
        }
      });
      $scope.grouplength=length;
      return callback();
    }

    function fetchEditData(group){
      $offlineData.get_gusers(group.gid,function(res){
        if(res.data.length===0)return;
        var gro=group;
        var uusers=res.data;
        angular.forEach(uusers, function(v, k){
          uusers[k].uid=uusers[k].id;
          uusers[k].id = k;
        });
        gro.users=uusers;
        $scope.newGroup(gro);
      });
    }

  });
