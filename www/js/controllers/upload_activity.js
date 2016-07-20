angular.module('uploadActivityController', ['moodleData', 'localStorage'])
  .controller('UploadActivityCtrl', function($scope, $state, $moodleData, $localStorage, $ionicLoading, $ionicPopup, $ionicActionSheet,$offlineData) {
    $scope.showGroup=-1;
    $scope.layout='group';

    $scope.set_layout=function(b){
      $scope.layout=b;
      if(b==='group')$scope.select_flag=false;
    };

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

    $scope.uploadActions = function(c,g,group) {
      var text='';
      switch(group.status){
        case 1:
          text='New Activity';
          break;
        case 2:
          text='Delete Activity';
          break;
      }
      // Show the action sheet
      var uploadSheet = $ionicActionSheet.show({
        buttons: [
          { text: text}
        ],
        // destructiveText: 'Delete Draft User',
        titleText: "Actions" ,
        cancelText: 'Cancel',
        buttonClicked: function(index) {
          $scope.uploadGroup(c,g,group);
          return true;
        }
      });
    };

    $scope.uploadUserActions = function(user,act) {
      var text='';
      switch(act.status){
        case 1:
          text='New Activity';
          break;
        case 2:
          text='Delete Activity';
          break;
      }
      // Show the action sheet
      var uploadSheet = $ionicActionSheet.show({
        buttons: [
          { text: text}
        ],
        // destructiveText: 'Delete Draft User',
        titleText: "Actions" ,
        cancelText: 'Cancel',
        buttonClicked: function(index) {
          $scope.uploadUser(user,act);
          return true;
        }
      });
    };

    $scope.uploadUser = function(user,act){
      $scope.showLoader();
      var index=$scope.user_trackers.indexOf(user);
      var k=user.acts.indexOf(act);
      // new activity
      if(act.status == 1){
        // $offlineData.add_group_activity(c.course_id,g.group_id,'--',act.date,act.minute,function (res) {
        $offlineData.add_group_activity(act.course_id,'--',user.uid,act.date,act.minutes,function (res) {
          act.id=res.data;
          act.status=0;
          user.acts.splice(k,1,act);
          $scope.user_trackers.splice(index,1,user);
          $localStorage.setObject('user_trackers',$scope.user_trackers);
        });
      }
      //delete activity
      if(act.status == 2){
        $offlineData.delete_group_activity(act.id,function (res) {
          user.acts.splice(k,1);
          $scope.group_trackers.splice(index,1,user);
          $localStorage.setObject('user_trackers',$scope.user_trackers);
        });
      }
      $scope.hideLoader();
    };


    $scope.uploadGroup = function(c,g,act){
      $scope.showLoader();
      var index=$scope.group_trackers.indexOf(c);
      var inx=c.groups.indexOf(g);
      var k=g.acts.indexOf(act);
      // new activity
      if(act.status == 1){
        $offlineData.add_group_activity(c.course_id,g.group_id,'--',act.date,act.minutes,function (res) {
          act.id=res.data;
          act.status=0;
          g.acts.splice(k,1,act);
          c.groups.splice(inx,1,g);
          $scope.group_trackers.splice(index,1,c);
          $localStorage.setObject('group_trackers',$scope.group_trackers);
        });
      }
      //delete activity
      if(act.status == 2){
        $offlineData.delete_group_activity(act.id,function (res) {
          g.acts.splice(k,1);
          c.groups.splice(inx,1,g);
          $scope.group_trackers.splice(index,1,c);
          $localStorage.setObject('group_trackers',$scope.group_trackers);
        });
      }
      $scope.hideLoader();
    };


    function fetchData(){
      $scope.group_trackers=$localStorage.getItem('group_trackers');
      var length=0;
      angular.forEach($scope.group_trackers, function(tra, i){
        angular.forEach(tra.groups,function (g, is){
          angular.forEach(g.acts,function (act, ii) {
            if(act.status!=0){
              length++;
            }
          });
        });
      });

      $scope.user_trackers=$localStorage.getItem('user_trackers');
      angular.forEach($scope.user_trackers, function(tra, i){
          angular.forEach(tra.acts,function (act, ii) {
            if(act.status!=0){
              length++;
            }
          });
      });
      $scope.activitylength=length;
    }

    $scope.myFilter=function(group){
      return group.status!==0;
    };
  });
