/**
 * Created by Tomas Bujin on 6/16/2016.
 */
angular.module('offlineuploadController', ['moodleData', 'localStorage'])
  .controller('OfflineuploadCtrl', function($scope, $state, $moodleData, $localStorage, $ionicLoading, $ionicPopup,$offlineData){

    $scope.$on('$ionicView.afterEnter', function() {
      // fetch initial view data
      fetchData();
    });

    $scope.showLoader = function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="spiral"></ion-spinner><br>Loading users...'
      });
    };

    $scope.hideLoader = function(){
      $ionicLoading.hide();
    };

    $scope.doRefresh = function(){
      // fetchData();
    };

    $scope.edit = function(user){
      $state.go('offline.edituser', {id: user.id});
    };

    $scope.delete = function(user){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Draft User',
        template: 'Are you sure you want permanently remove this draft user?'
      });

      confirmPopup.then(function(res) {
        if(res) {
          // remove the user
          var users = $localStorage.getItem('offlineUsers');
          users.splice(user.id, 1);
          // reindex the users array
          angular.forEach(users, function(v, k){
            users[k].id = k;
          });
          // store the updated users array
          $localStorage.setObject('offlineUsers', users);

          fetchData();
        }
      });
    };

    $scope.newUser = function(user){
      $state.go('offline.newuser');
    };

    function fetchData(){
      $scope.showLoader();
      $scope.users = $localStorage.getItem('offlineUsers');
      $scope.hideLoader();
      $scope.$broadcast('scroll.refreshComplete');
    }

  });
