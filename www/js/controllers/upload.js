/**
 * Created by Tomas Bujin on 7/15/2016.
 */
angular.module('uploadController', ['moodleData', 'localStorage'])
  .controller('UploadCtrl', function($scope, $state, $moodleData, $localStorage, $ionicLoading, $ionicPopup, $ionicActionSheet,$offlineData){

    $scope.$on('$ionicView.beforeEnter', function() {
      // authorize
      $moodleData.authorize();

      $scope.countries = $moodleData.country_list();
      $scope.countryCode='AU';

      $scope.showGroup={};
      $scope.groups=[];
      $scope.fusers=[];
      $scope.courses=[];


      $scope.course=[];
      $scope.users=[];
      $scope.gusers=[];
      $scope.data={};

      $scope.modal={};
      $scope.selection={};
      $scope.length={};
      $scope.length.user=0;
      $scope.length.group=0;
      $scope.length.activity=0;

      $scope.selection={};

      fetchData();

    });

    $scope.layout='group';

    $scope.set_layout=function(b){
      $scope.layout=b;
      if(b==='group')$scope.select_flag=false;
    };

    $scope.uploadGroupActions = function(css,group) {
      $scope.selection.course=css;
      $scope.selection.group=group;
      var text='';
      if(group.status===5)return;
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
      //edit group
      if(group.status == 2){
        // set id to existing user's id for update
        var uuuu=group.users;
        var del_users=[];
        angular.forEach(uuuu,function (fff, iii, rrr) {
          if(fff.status===3){
            fff.id=fff.uid;
            del_users.push(fff);
            group.users.splice(iii,1);
          }
        });
        if(del_users.length>0){
          $offlineData.del_gusers(group.group_id,del_users,function(re){
            $offlineData.add_gusers(group.group_id,group.group_name,group.users,function(re){
              if(re.data==='OK') fetchEditData(group);
            });
          });
        }else{
          $offlineData.add_gusers(group.group_id,group.group_name,group.users,function(re){
            if(re.data==='OK') fetchEditData(group);
          });
        }
      }
      // new group
      if(group.status == 1){
        var course=$scope.selection.course;
        $offlineData.add_group(group.group_name,function(re){
          group.gid=re.data[0].group_id;
          group.group_id=re.data[0].group_id;
          $offlineData.course_add_group(course.course_id,group.gid,'--',function (res) {
            $scope.newGroup(group);
          })
          // fetchData();
        });
      }

      //delete group
      if(group.status == 3){
        var confirmPopup = $ionicPopup.confirm({
          title: 'Delete Group',
          template: 'Are you sure you want permanently remove this Group?'
        });

        confirmPopup.then(function(res) {
          if(res) {
            $offlineData.delete_group(group.group_id,function(re){
              $scope.removeGroup(group);
              // fetchData();
            });
          }
        });

      }
      $scope.hideLoader();
    };

    function fetchEditData(group){
      $offlineData.get_gusers(group.group_id,function(res){
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

    $scope.newGroup = function(group){
      var course=$scope.selection.course;
      var index=$scope.groups.indexOf(course);
      var groups=course.groups;
      var inx=groups.indexOf($scope.selection.group);

      var acts=group.acts;
      var fflag=true;
      angular.forEach(acts,function (ddd, iii, rrr) {
        if(ddd.status!==0){
          fflag=false;
        }
      });
      if(fflag){
        group.status=0;
        course.status=0;
      }else{
        group.status=5;
      }
      groups.splice(inx, 1,group);
      course.groups=groups;
      $scope.groups.splice(index,1,course);
      // store the updated users array
      $localStorage.setObject('moodle_groups', $scope.groups);
    };

    function checkExistingUsers(callback){
      $scope.fusers = $localStorage.getItem('moodle_users');
      $scope.groups = $localStorage.getItem('moodle_groups');
      $scope.courses = $localStorage.getItem('moodle_courses');
      var user_length=0;
      var group_length=0;
      var activity_length=0;

      var courses=$scope.groups;
      // course-group-activity(user)
      angular.forEach(courses, function(v, k,ar){
        var groups=v.groups;
        angular.forEach(groups, function(vv, kk,arr){
          if(vv.status!==0 && vv.status!==5){
            group_length++;
          }
          angular.forEach(vv.acts,function(vvv,kkk,arrr){
            if(vvv.status!==0){
              console.log('group='+JSON.stringify(v));
              activity_length++;
            }
          });
        });

      });

      angular.forEach($scope.fusers, function(tra, i){
        if(tra.status!==0)user_length++;
        angular.forEach(tra.acts,function (act, ii) {
          if(act.status!=0){
            activity_length++;
          }
        });
      });
      $scope.length.user=user_length;
      $scope.length.group=group_length;
      $scope.length.activity=activity_length;
      return callback();
    }

    $scope.removeGroup = function(group){
      var course=$scope.selection.course;
      var index=$scope.courses.indexOf(course);
      var groups=course.groups;
      var inx=groups.indexOf(group);
      groups.splice(inx, 1);
      course.groups=groups;
      $scope.courses.splice(index,1,course);
      // store the updated users array
      $localStorage.setObject('moodle_groups', groups);
    };

    //upload group activity
    $scope.uploadGroupActivityActions = function(c,g,group) {
      if(g.status!==0 && g.status!==5){
        var alertPopup = $ionicPopup.alert({
          title: 'Warning',
          template: 'Group must be uploaded.'
        });
        alertPopup.then(function(res) {
        });
        return;
      };
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
          $scope.uploadActivity(c,g,group);
          return true;
        }
      });
    };

    $scope.uploadActivity = function(c,g,act){
      $scope.showLoader();
      var index=$scope.groups.indexOf(c);
      var inx=c.groups.indexOf(g);
      var k=g.acts.indexOf(act);
      // new activity
      if(act.status == 1){
        $offlineData.add_group_activity(c.course_id,g.group_id,'--',act.date,act.minutes,function (res) {
          act.id=res.data;
          act.status=0;
          g.acts.splice(k,1,act);
          g.status=0;
          c.groups.splice(inx,1,g);
          c.status=0;
          $scope.groups.splice(index,1,c);
          $localStorage.setObject('moodle_groups',$scope.groups);
        });
      }
      //delete activity
      if(act.status == 2){
        $offlineData.delete_group_activity(act.id,function (res) {
          g.acts.splice(k,1);
          g.status=0;
          c.groups.splice(inx,1,g);
          c.status=0;
          $scope.groups.splice(index,1,c);
          $localStorage.setObject('moodle_groups',$scope.groups);
        });
      }
      $scope.hideLoader();
    };

    //upload users
    $scope.uploadUserAction = function(user) {
      var text='';
      if(user.status===5)return;
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
          { text: text}
        ],
        // destructiveText: 'Delete Draft User',
        titleText: "Actions for " + user.username,
        cancelText: 'Cancel',
        buttonClicked: function(index) {
          $scope.uploadUser(user);
          return true;
        }
      });
    };

    $scope.uploadUser = function(user){
      $scope.showLoader();
      var userid = user.id;
      //edit user
      if(user.status == 2){
        // set id to existing user's id for update
        // user.id = user.uid;
        // $moodleData.update_user(user, function(){
        //   // restore original ID
        //   user.id = userid;
        //   $scope.newUser(user);
        //   // fetchData();
        // });
        var uss=[];
        uss.push(user);
        $offlineData.add_gusers('--','--',uss,function (res) {
          // user.uid=res.data[0].id;
          $scope.newUser(user);
          // fetchData();
        });


      }
      // new user
      if(user.status == 1){
        // $moodleData.create_user(user, function(res){
        //   user.uid=res.data[0].id;
        //
        //   $scope.newUser(user);
        //   // fetchData();
        // });
        user.uid='--';
        var uss=[];
        uss.push(user);
        $offlineData.add_gusers('--','--',uss,function (res) {
            user.uid=res.data[0].id;
            $scope.newUser(user);
            // fetchData();
        });
      }

      //delete user
      if(user.status == 3){
        $scope.removeOfflineUser(user);
        // fetchData();
      }

      $scope.hideLoader();
    };

    $scope.newUser = function(user){
      var acts=user.acts;
      var fflag=true;
      angular.forEach(acts,function (ddd, iii, rrr) {
        if(ddd.status!==0)fflag=false;
      });
      if(fflag){
        user.status=0;
      }else{
        user.status=5;
      }

      $scope.fusers.splice(user.id, 1,user);
      // store the updated users array
      $localStorage.setObject('moodle_users', $scope.fusers);
    };

    $scope.deleteUser = function(user){

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

    $scope.removeOfflineUser = function(user){
      // var users = $localStorage.getObject('offlineUsers');
      $scope.fusers.splice(user.id, 1);
      // reindex the users array
      angular.forEach($scope.fusers, function(v, k){
        $scope.fusers[k].id = k;
      });
      // store the updated users array
      $localStorage.setObject('moodle_users', $scope.fusers);
    };

    //upload user activity

    $scope.uploadUserActivity = function(user,act) {
      if(user.status!==0 && user.status!==5){
        var alertPopup = $ionicPopup.alert({
          title: 'Warning',
          template: 'User must be uploaded.'
        });
        alertPopup.then(function(res) {
        });
        return;
      }
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
          $scope.uploadUserAct(user,act);
          return true;
        }
      });
    };

    $scope.uploadUserAct = function(user,act){
      $scope.showLoader();
      var index=$scope.fusers.indexOf(user);
      var k=user.acts.indexOf(act);
      // new activity
      if(act.status == 1){
        // $offlineData.add_group_activity(c.course_id,g.group_id,'--',act.date,act.minute,function (res) {
        $offlineData.add_group_activity(act.course_id,'--',user.uid,act.date,act.minutes,function (res) {
          act.id=res.data;
          act.status=0;
          user.acts.splice(k,1,act);
          user.status=0;
          $scope.fusers.splice(index,1,user);
          $localStorage.setObject('moodle_users',$scope.fusers);
        });
      }
      //delete activity
      if(act.status == 2){
        $offlineData.delete_group_activity(act.id,function (res) {
          user.acts.splice(k,1);
          $scope.fusers.splice(index,1,user);
          $localStorage.setObject('moodle_users',$scope.fusers);
        });
      }
      $scope.hideLoader();
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
    };

    $scope.showLoader = function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="spiral"></ion-spinner><br>Working...'
      });
    };

    $scope.hideLoader = function(){
      $ionicLoading.hide();
    };
  });
