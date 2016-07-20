/**
 * Created by Tomas Bujin on 6/19/2016.
 */
angular.module('offlineActivityControl', ['offlineData', 'localStorage'])
  .controller('OfflineActivityCtrl', function($scope, $state, $moodleData,$ionicPopup,$ionicModal,$localStorage,$offlineData, $ionicLoading,$rootScope){
    $scope.today=new Date();
    $scope.$on('$ionicView.beforeEnter', function() {
      // fetch initial view data
      $scope.countries = $moodleData.country_list();
      $scope.countryCode='AU';
      $scope.group_trackers=[];
      $scope.user_trackers=[];
      $scope.course=[];
      $scope.selection={};
      $scope.omodal={};
      // $scope.modal.date=new Date();
      $scope.read_groups();

    });

    $scope.showGroup=-1;
    $scope.layout='group';
    $scope.groups=[];
    $scope.users=[];

    $scope.data={};
    $scope.fusers=[];

    $scope.select_flag=false;
    $scope.select_users=[];


    $scope.set_layout=function(b){
      $scope.layout=b;
      if(b==='group')$scope.select_flag=false;
    };

    $scope.read_groups=function(){
      $scope.user_trackers = $localStorage.getItem('moodle_users');
      $scope.group_trackers= $localStorage.getItem('moodle_groups');
      // $scope.user_trackers=$localStorage.getItem('user_trackers');
      if($scope.group_trackers.length===0){
        $offlineData.get_activity('group',function(res){
          $scope.group_trackers=res.data;
          var courses=$scope.group_trackers;
          // course-group-activity(user)
          angular.forEach(courses, function(v, k){
            courses[k].status=0;
            courses[k].id = k;
            var groups=v.groups;
            angular.forEach(groups, function(vv, kk){
              groups[kk].status=0;
              groups[kk].gid=groups[kk].id;
              groups[kk].id = kk;
            });
            courses[k].groups=groups;
          });
          $scope.group_trackers=courses;
          $localStorage.setObject('moodle_groups',courses);
        });
      }
      if($scope.user_trackers.length===0){

          $offlineData.get_fusers(function(res){
            var ffuser=res.data;
            angular.forEach(ffuser, function(v, k){
              ffuser[k].status = 0;
              ffuser[k].uid=ffuser[k].id;
              ffuser[k].id = k;
              ffuser[k].fullname=ffuser[k].firstname+' '+ffuser[k].lastname;
            });
            $scope.user_trackers=ffuser;
            $localStorage.setObject('moodle_users',ffuser);


            // $localStorage.setObject('user_trackers',$scope.user_trackers);
          });

      }
      if($scope.course.length===0){
        $offlineData.get_course(function(res){
          $scope.course=res.data;
          $localStorage.setObject('moodle_courses',res.data);
        });
      }
    };

    $scope.add_acts=function(course,group){
      var index=$scope.group_trackers.indexOf(course);
      if(!course.groups)course.groups=[];
      var inx=course.groups.indexOf(group);
      console.log('inx='+inx);
      $scope.selection.group=group;
      $scope.selection.course=course;
      if(group.status!==1 && !group.acts){
        $offlineData.get_group_activity(course.course_id,group.group_id,function (res) {
          var data=res.data;
          angular.forEach(data,function (dd, i, arr) {
            data[i].status=0;
          });
          group.acts=data;
          course.groups.splice(inx,1,group);
          $scope.group_trackers.splice(index,1,course);
          $localStorage.setObject('moodle_groups',$scope.group_trackers);
        });
      }
    };

    $scope.isActive=function (group) {
      return $scope.selection.group===group;
    };

    $scope.isUserActive=function (user) {
      return $scope.selection.user===user;
    };

    $ionicModal.fromTemplateUrl('templates/offline_activity_create.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.activity_omodal = modal;
    });

    $scope.show_omodal=function () {
      if(!$scope.selection.group)return;
      $scope.activity_omodal.show();
    };

    $scope.show_user_omodal=function () {
      if(!$scope.selection.user)return;
      $scope.activity_omodal.show();
    };

    $scope.hide_omodal=function () {
      $scope.activity_omodal.hide();
    };

    $scope.add_course=function (user) {
      var index=$scope.user_trackers.indexOf(user);
      $scope.selection.user=user;

      if(user.status!==1 && !user.acts){
        $offlineData.get_user_activity(user.uid,function (res) {
          var data=res.data;
          angular.forEach(data,function (dd, i, arr) {
            data[i].status=0;
          });
          user.acts=data;
          $scope.user_trackers.splice(index,1,user);
          $localStorage.setObject('moodle_users',$scope.user_trackers);
        });
      }
    };

    $scope.add_act_confirm=function () {
      if($scope.omodal.date.getTime()>$scope.today.getTime()){
        $scope.omodal.date=new Date();
        return;
      }
      if(!angular.isNumber($scope.omodal.minute)){
        $scope.omodal.minute=0;
        return;
      }

      if($scope.layout==='group'){
        var index=$scope.group_trackers.indexOf($scope.selection.course);
        if(!$scope.selection.course.groups)$scope.selection.course.groups=[];
        var inx=$scope.selection.course.groups.indexOf($scope.selection.group);
        if(!$scope.selection.group.acts)$scope.selection.group.acts=[];
        if($scope.selection.group.status===0)$scope.selection.group.status=5;
        $scope.selection.course.status=1;
        var att={id:'---',date:$scope.omodal.date,minutes:$scope.omodal.minute,status:1};
        $scope.selection.group.acts.push(att);
        $scope.selection.course.groups.splice(inx,1,$scope.selection.group);
        $scope.group_trackers.splice(index,1,$scope.selection.course);
        $localStorage.setObject('moodle_groups',$scope.group_trackers);
        $scope.hide_omodal();
      }else{
        var index=$scope.user_trackers.indexOf($scope.selection.user);
        if($scope.selection.user.status===0)$scope.selection.user.status=5;
        if(!$scope.selection.user.acts)$scope.selection.user.acts=[];
        var fullname='';
        angular.forEach($scope.course,function (dd, ind, aa) {
          if(dd.course_id===$scope.omodal.course){
            fullname=dd.fullname;
          }
        });
        var att={id:'--',date:$scope.omodal.date,minutes:$scope.omodal.minute,course_id:$scope.omodal.course,course_name:fullname,status:1};
        $scope.selection.user.acts.push(att);
        $scope.user_trackers.splice(index,1,$scope.selection.user);
        $localStorage.setObject('moodle_users',$scope.user_trackers);
        $scope.hide_omodal();

      }
    };

    $scope.delete_group_activity=function (course,group,act) {
      var index=$scope.group_trackers.indexOf(course);
      var inx=course.groups.indexOf(group);
      var k=group.acts.indexOf(act);
      act.status=2;
      group.status=5;
      course.status=1;
      group.acts.splice(k,1,act);
      course.groups.splice(inx,1,group);
      $scope.group_trackers.splice(index,1,course);
      $localStorage.setObject('moodle_groups',$scope.group_trackers);
      // $offlineData.delete_group_activity(act.id,function (res) {
      //
      // });
    };

    $scope.delete_user_activity=function (user,cs) {
      var index=$scope.user_trackers.indexOf(user);
      var inx=user.acts.indexOf(cs);
      cs.status=2;
      user.acts.splice(inx,1,cs);
      user.status=5;
      $scope.user_trackers.indexOf(index,1,user);
      $localStorage.setObject('moodle_users',$scope.user_trackers);
    };

    $scope.isShown=function(b){
      return $scope.showGroup===b.id;
    };

    $scope.showLoader = function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="spiral"></ion-spinner><br>Downloading users, please wait...'
      });
    };

    $scope.hideLoader = function(){
      $ionicLoading.hide();
    };

    $scope.doRefresh = function(){
      fetchData();
    };

    $scope.myFilter=function(g){
      return g.status!==2;
    };


    function fetchData(){
    }

  });
