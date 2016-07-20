/**
 * Created by Tomas Bujin on 6/18/2016.
 */
angular.module('offlineTrackerController', ['offlineData', 'localStorage'])
  .controller('OfflineTrackerCtrl', function($scope, $state, $moodleData,$ionicPopup,$localStorage,$offlineData, $ionicLoading,$rootScope){

    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.type=$rootScope.track_type;
      $scope.obj=$rootScope.track_data;
      $scope.data=[];
      $scope.tdata=[];
      $scope.init();
    });

    $scope.init=function () {
      switch($scope.type){
        case 1:
              $scope.tdata=$localStorage.getItem('group_track');
              break;
        case 2:
              $scope.tdata=$localStorage.getItem('user_track');
              break;
        case 3:
              $scope.tdata=$localStorage.getItem('group_user_track');
              break;
      }
      if(!$scope.tdata)$scope.tdata=[];
      var tid=$scope.obj.tid;
      if(tid===0 || tid){
        $scope.data=$scope.tdata[tid];
      }
    };

    $scope.add_track=function(){
      // An elaborate, custom popup
      $scope.input={};
      $scope.input.date=new Date();
      var myPopup = $ionicPopup.show({
        template: '<input type="date" ng-model="input.date" placeholder="Please select date."><input type="text" placeholder="Please type time" ng-model="input.time">',
        title: 'Enter Activity ',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.input.date || !$scope.input.time) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                var value={date:$scope.input.date,time:$scope.input.time};
                return value;
              }
            }
          }
        ]
      });

      myPopup.then(function(res) {
        if(res) {
          $scope.data_save(res);
        }
      });

    };

    $scope.data_save=function(data){
      data.id=$scope.data.length;
      $scope.data.push(data);
      if(!$scope.obj.tid){
        $scope.obj.tid=$scope.tdata.length;
      }
      $scope.tdata.splice($scope.obj.tid,1,$scope.data);
      switch($scope.type){
        case 1:
          $localStorage.setObject('group_track',$scope.tdata);
          var groups = $localStorage.getItem('offlineGroups');
          groups.splice($scope.obj.id,1,$scope.obj);
          $localStorage.setObject('offlineGroups',groups);
          break;
        case 2:
          $localStorage.setObject('user_track',$scope.tdata);
          var users = $localStorage.getItem('offlineUsers');
          users.splice($scope.obj.id,1,$scope.obj);
          $localStorage.setObject('offlineUsers',users);
          break;
        case 3:
          $localStorage.setObject('group_user_track',$scope.tdata);
          var groups = $localStorage.getItem('offlineGroups');
          var group=groups[$scope.obj.gid];
          var users=group.users;
          angular.forEach(users,function (user,index) {
            if(user.uid===$scope.obj.uid){
              users.splice(index,1,$scope.obj);
            }
          });
          group.users=users;
          groups.splice($scope.obj.gid,1,group);
          $localStorage.setObject('offlineGroups',groups);
          break;
      }
    };

    $scope.delete_activity=function(item){
      $scope.data.splice(item.id,1);
      $scope.tdata.splice($scope.obj.tid,1,$scope.data);
      switch($scope.type){
        case 1:
          $localStorage.setObject('group_track',$scope.tdata);
          var groups = $localStorage.getItem('offlineGroups');
          groups.splice($scope.obj.id,1,$scope.obj);
          $localStorage.setObject('offlineGroups',groups);
          break;
        case 2:
          $localStorage.setObject('user_track',$scope.tdata);
          var users = $localStorage.getItem('offlineUsers');
          users.splice($scope.obj.id,1,$scope.obj);
          $localStorage.setObject('offlineUsers',users);
          break;
        case 3:
          $localStorage.setObject('group_user_track',$scope.tdata);
          var groups = $localStorage.getItem('offlineGroups');
          var group=groups[$scope.obj.gid];
          var users=group.users;
          angular.forEach(users,function (user,index) {
            if(user.uid===$scope.obj.uid){
              users.splice(index,1,$scope.obj);
            }
          });
          group.users=users;
          groups.splice($scope.obj.gid,1,group);
          $localStorage.setObject('offlineGroups',groups);
          break;
      }
    }


  })
;
