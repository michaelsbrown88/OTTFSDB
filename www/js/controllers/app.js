angular.module('appController', ['localStorage'])
  .controller('AppCtrl', function($scope, $state, $localStorage,$location) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //
    //});
       if(localStorage.getItem('moodle_role')==5){
        
           $scope.get_url = '#/app/activity';
           
       } else{
           $scope.get_url = '#/offline/users';
       }
    
    
    $scope.showMenu = function(arr){
        var match = false;
        for(i=0;i<arr.length;i++){
            if(arr[i]==localStorage.getItem('moodle_role')){
               match = true; 
            }
        }
        return match;
    };
    

    $scope.clearLogin = function(){
        localStorage.clear();  
    };

    $scope.draftUserCount = function(){
      // var users = $localStorage.getObject('offlineUsers');
      // var length=0;
      // angular.forEach(users,function (user, index, array) {
      //   if(user.status!=0)length++;
      // });
      // return length;

      $scope.fusers = $localStorage.getItem('moodle_users');
      $scope.groups = $localStorage.getItem('moodle_groups');
      $scope.courses = $localStorage.getItem('moodle_courses');
      var user_length=0;

      var courses=$scope.groups;
      // course-group-activity(user)
      angular.forEach(courses, function(v, k,ar){
        var groups=v.groups;
        angular.forEach(groups, function(vv, kk,arr){
          if(vv.status!==0 && vv.status!==5)user_length++;
          angular.forEach(vv.acts,function(vvv,kkk,arrr){
            if(vvv.status!==0)user_length++;
          });
        });

      });

      angular.forEach($scope.fusers, function(tra, i){
        if(tra.status!==0 && tra.status!==5)user_length++;
        angular.forEach(tra.acts,function (act, ii) {
          if(act.status!==0){
            user_length++;
          }
        });
      });

      return user_length;

    };

    // $scope.draftGroupCount = function(){
    //   var groups = $localStorage.getObject('offlineGroups');
    //   var length=0;
    //   angular.forEach(groups,function (group, index, array) {
    //     if(group.status!=0)length++;
    //   });
    //   return length;
    // }
    //
    // $scope.draftActivityCount = function(){
    //   var group_trackers=$localStorage.getItem('group_trackers');
    //   var length=0;
    //   angular.forEach(group_trackers, function(tra, i){
    //     angular.forEach(tra.groups,function (g, is){
    //       angular.forEach(g.acts,function (act, ii) {
    //         if(act.status!=0){
    //           length++;
    //         }
    //       });
    //     });
    //   });
    //
    //   var user_trackers=$localStorage.getItem('user_trackers');
    //   angular.forEach(user_trackers, function(tra, i){
    //     angular.forEach(tra.acts,function (act, ii) {
    //       if(act.status!=0){
    //         length++;
    //       }
    //     });
    //   });
    //   return length;
    // }

  });
