angular.module('uploadUsersController', ['moodleData', 'localStorage'])
  .controller('UploadUsersCtrl', function($scope, $state, $moodleData, $localStorage, $ionicLoading, $ionicPopup, $ionicActionSheet){

    $scope.$on('$ionicView.beforeEnter', function() {
      // authorize
      $moodleData.authorize();
    });

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

    $scope.removeOfflineUser = function(user){
      var users = $localStorage.getObject('offlineUsers');
      users.splice(user.id, 1);
      // reindex the users array
      angular.forEach(users, function(v, k){
        users[k].id = k;
      });
      // store the updated users array
      $localStorage.setObject('offlineUsers', users);
    };

    $scope.newUser = function(user){
      user.status=0;
      var users = $localStorage.getObject('offlineUsers');
      users.splice(user.id, 1,user);
      // store the updated users array
      $localStorage.setObject('offlineUsers', users);
    };

    $scope.delete = function(user){

      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Draft User',
        template: 'Are you sure you want permanently remove this draft user?'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $scope.removeOfflineUser(user);
          fetchData();
        }
      });
    };

    $scope.uploadActions = function(user) {
      console.log(user);
      var text='';
      switch(user.status){
        case 1:
              text='New User';
              break;
        case 2:
              text='Edit User';
              break;
        case 3:
              text='Delete User';
              break;
      }
      // Show the action sheet
      var uploadSheet = $ionicActionSheet.show({
        buttons: [
          // { text: 'Upload Draft User' },
          { text: text}
        ],
        // destructiveText: 'Delete Draft User',
        titleText: "Actions for " + user.username,
        cancelText: 'Cancel',
        buttonClicked: function(index) {
          // if(index == 1){
          //   $state.go('offline.edituser', {id: user.id});
          // }
          // if (index == 0){
            $scope.uploadUser(user);
          // }
          return true;
        // },
        // destructiveButtonClicked: function(){
        //   uploadSheet();
        //   console.log('delete ' + user.id);
        //   $scope.delete(user);
        }
      });
    };

    $scope.uploadUser = function(user){
      $scope.showLoader();
      var userid = user.id;
      // existing user
      //edit user
      if(user.status == 2){
        // set id to existing user's id for update
        user.id = user.uid;
        $moodleData.update_user(user, function(){
          // restore original ID
          user.id = userid;
          $scope.newUser(user);
          fetchData();
        });
      }
      // new user
      if(user.status == 1){
        $moodleData.create_user(user, function(){
          $scope.newUser(user);
          fetchData();
        });
      }

      //delete user
      if(user.status == 3){
        $scope.removeOfflineUser(user);
        fetchData();
      }

      $scope.hideLoader();
    };

    $scope.group_user=function(group,user){

    };



    $scope.doRefresh = function(){
      fetchData();
    };

    $scope.myFilter=function(user){
      return user.status!==0;
    };

    function fetchData(){
      $scope.showLoader();
      checkExistingUsers(function(){
        $scope.hideLoader();
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    function checkExistingUsers(callback){
      $scope.users = $localStorage.getObject('offlineUsers');
      var length=0;
      angular.forEach($scope.users, function(user, i){
        if(user.status!=0){
          length++;
        }
      });
      $scope.userlength=length;
      return callback();
    }

  });
