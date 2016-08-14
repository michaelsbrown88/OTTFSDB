/**
 * Created by Tomas Bujin on 7/2/2016.
 */
angular.module('groupController', ['offlineData', 'localStorage'])
  .controller('GroupCtrl', function($scope, $state, $moodleData,$ionicPopup,$ionicModal,$localStorage,$offlineData, $ionicLoading){
    $scope.$on('$ionicView.enter', function() {
      // fetch initial view data
      $scope.countries = $moodleData.country_list();
      $scope.countryCode=localStorage.getItem('user_country');
      $scope.user_role=localStorage.getItem('moodle_role');
      $scope.token=localStorage.getItem('ottfToken'); 
      $scope.selection={};
      $scope.showGroup={};
      $scope.ggroups=[];
      $scope.ffusers=[];
      $scope.ccourses=[];
      $scope.course=[];

      $scope.users=[];
      $scope.gusers=[];
      $scope.data={};

      $scope.modal={};

      $scope.read_groups();
      //console.log($scope.ffusers);  
    
    });
    
    $scope.haveNoRights = function(){
        if(localStorage.getItem('moodle_role')==4){
            return true;
        }else{
            return false;
        }
    };

    $scope.select_flag=false;
    $scope.select_users=[];



    // $scope.set_layout=function(b){
    //   $scope.layout=b;
    //   if(b==='group')$scope.select_flag=false;
    // };

    $ionicModal.fromTemplateUrl('templates/group_create.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.group_modal = modal;
    });

    $scope.show_modal=function () {
      $scope.group_modal.show();
    };

    $scope.hide_modal=function () {
      $scope.group_modal.hide();
    };

    $scope.read_groups=function(){
        
    $scope.ffusers = $localStorage.getItem('moodle_users');
    if(localStorage.getItem('moodle_role')==4){
        angular.forEach($scope.ffusers, function(v, k){
              //console.log($scope.ffusers[k]);
               if(localStorage.getItem('user_country')!=$scope.ffusers[k].country){
                   //console.log(localStorage.getItem('user_country'),$scope.ffusers[k].country)
                   delete $scope.ffusers[k];
               }  
          });   
    }
        
  
    //$scope.ffusers = $localStorage.getItem('moodle_users');
      $scope.ggroups = $localStorage.getItem('moodle_groups');
      $scope.ccourses = $localStorage.getItem('moodle_courses');
      if($scope.ggroups.length===0){
        $offlineData.get_activity('group',function(res){
          $scope.ggroups=res.data;
          var courses=$scope.ggroups;
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
          $scope.ggroups=courses;
          
          $localStorage.setObject('moodle_groups',courses);
        });
      }
      if($scope.ffusers.length===0){
        $offlineData.get_fusers(function(res){
          var ffuser=res.data;
          angular.forEach(ffuser, function(v, k){
            ffuser[k].status = 0;
            ffuser[k].uid=ffuser[k].id;
            ffuser[k].id = k;
            ffuser[k].fullname=ffuser[k].firstname+' '+ffuser[k].lastname;                         
          });
          $scope.ffusers=ffuser;
          
            
         if(localStorage.getItem('moodle_role')==4){
            angular.forEach($scope.ffusers, function(v, k){
                  //console.log($scope.ffusers[k]);
                   if(localStorage.getItem('user_country')!=$scope.ffusers[k].country){
                       //console.log(localStorage.getItem('user_country'),$scope.ffusers[k].country)
                       delete $scope.ffusers[k];
                   }  
              });   
        }    

        
          $localStorage.setObject('moodle_users',ffuser);
        });
      }

                     
      if($scope.ccourses.length===0){
        $offlineData.get_course(function(res){
          $scope.ccourses=res.data;
          $localStorage.setObject('moodle_courses',res.data);
        });
      }
    };

    $scope.toggleChange=function (bbb,uu) {
      if(bbb){
        $scope.select_users.push(uu);
      }else{
        var index=$scope.select_users.indexOf(uu);
        $scope.select_users.splice(index,1);
      }
    };

    $scope.delete_group=function(){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm',
        template: 'Are you sure you want to delete groups?'
      });

      confirmPopup.then(function(res) {
        var cs=$scope.selection.course;
        var u=$scope.selection.group;
        var index=$scope.ggroups.indexOf(cs);
        var inx=cs.groups.indexOf(u);
        var courses=$scope.ggroups;
        var groups=cs.groups;

        var users=u.users;
        if(users && users.length>0){
          var alertPopup = $ionicPopup.alert({
            title: 'Warning',
            template: 'This group has users.'
          });

          alertPopup.then(function(res) {

          });
          return;
        }

        $offlineData.delete_group(u.group_id,function(res){
          groups.splice(inx,1);
          angular.forEach(groups, function(v, k){
            groups[k].id = k;
          });
          cs.groups=groups;
          courses.splice(index,1,cs);
          $scope.ggroups=courses;
          $scope.selection={};
          $localStorage.setObject('moodle_groups',courses);
        });
      });
    };
    //
    $scope.add_group=function(){
      $scope.show_modal();
    };

    $scope.add_group_confirm=function () {
      var index=-1;

      angular.forEach($scope.ggroups,function (ccc, kk, arr) {
        if(ccc.course_id===$scope.modal.course)index=kk;
      });
      var course;
      if(index===-1){
        angular.forEach($scope.ccourses,function (cccc, kkkk, aaa) {
          if(cccc.course_id===$scope.modal.course)course=cccc;
        })
      }
      course=$scope.ggroups[index];
      var groups=course.groups;
      var id=groups.length;

      $offlineData.add_group($scope.modal.groupname,function(re){
        var st=re.data;
        groups.push({id:id,group_name:$scope.modal.groupname,status:0,group_id:st[0].group_id,users:[]});
        // $scope.groups.push({id:id,group_name:$scope.modal.groupname,status:0,group_id:st[0].group_id});
        course.groups=groups;
        if(index===-1)$scope.ggroups.push(course);
        else $scope.ggroups.splice(index,1,course);
        $localStorage.setObject('moodle_groups',$scope.ggroups);

        $offlineData.course_add_group($scope.modal.course,st[0].group_id,'--',function (res) {
          $ionicLoading.show({
            noBackdrop: true,
            template: "Success",
            duration: 1000
          });
          $scope.hide_modal();
        });
      });
    };

    $scope.delete_user=function(c,g,u){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm',
        template: 'Are you sure you want to delete users?'
      });

      confirmPopup.then(function(res) {
        var courses=$scope.ggroups;
        var index=courses.indexOf(c);
        var groups=c.groups;
        var inx=groups.indexOf(g);
        var users=g.users;
        var k=users.indexOf(u);
          
        if(localStorage.getItem('moodle_role')==4){
            if(u.country == $scope.countryCode){
                var uss=[];
                uss.push(u);
                $offlineData.del_gusers(g.group_id,uss,function (res) {
                  users.splice(k,1);
                  g.users=users;
                  groups.splice(inx,1,g);
                  c.groups=groups;
                  courses.splice(index,1,c);

                  $localStorage.setObject('moodle_groups',courses);
                  $scope.ggroups=courses;
                });
            }else{
                $ionicPopup.alert({
                     title: 'Alert',
                     template: 'Not permitted'
                   });
            }            
        }else{
            var uss=[];
            uss.push(u);
            $offlineData.del_gusers(g.group_id,uss,function (res) {
              users.splice(k,1);
              g.users=users;
              groups.splice(inx,1,g);
              c.groups=groups;
              courses.splice(index,1,c);

              $localStorage.setObject('moodle_groups',courses);
              $scope.ggroups=courses;
            });        
        }

        /*
        var uss=[];
        uss.push(u);
        $offlineData.del_gusers(g.group_id,uss,function (res) {
          users.splice(k,1);
          g.users=users;
          groups.splice(inx,1,g);
          c.groups=groups;
          courses.splice(index,1,c);

          $localStorage.setObject('moodle_groups',courses);
          $scope.ggroups=courses;
        });*/
      })
    };
    //
    $scope.add_user=function () {
      $scope.show_select_user_modal();
    };

    $scope.add_users=function(){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm',
        template: 'Are you sure you want to add users?'
      });

      confirmPopup.then(function(res) {
        if(res) {
          var select_users=$scope.select_users;
          var course=$scope.selection.course;
          var group=$scope.selection.group;
          var groups=course.groups;
          var index=$scope.ggroups.indexOf(course);
          var inx=groups.indexOf(group);
          var ulist=group.users;
          if(!ulist)ulist=[];
          for(var i=0;i<select_users.length;i++){
            var ud=select_users[i];
            ud.id=ulist.length;
            ulist.push(ud);
          }
          $offlineData.add_gusers(group.group_id,group.group_name,ulist,function (res) {
            group.users=ulist;
            groups.splice(inx,1,group);
            course.groups=groups;
            $scope.ggroups.splice(index,1,course);
            $scope.select_users=[];
            $localStorage.setObject('moodle_groups',$scope.ggroups);
          });
        } else {
          return;
        }
        $scope.hide_select_user_modal();

      });
    };
    function get_role(username){
        var u = $localStorage.getObject('moodle_users');
        var val = 0;
        angular.forEach(u, function(i, j){
            if(u[j].username == username){
                val =  u[j].roleid;
                if(val==null) val=5;
            }
        });
        return val;

    }
    function get_context(username){
        var u = $localStorage.getObject('moodle_users');
        var val =0;
        angular.forEach(u, function(i, j){
            if(u[j].username == username){
               
                val = u[j].context_id;
                if(val==null) val=0;
            }
        });
        return val;
    }  
    
    $scope.show_users=function (c, g) {
        
        
      if(localStorage.getItem("moodle_role") == 5){
          for(i=0;i<g.users.length;i++){
              if(g.user[i].country != localStorage.getItem("user_country")){
                  g.user.splice(i,1);
              }
          }
      }
            
        
      $scope.selection.course=c;
      $scope.selection.group=g;
      var index=$scope.ggroups.indexOf(c);
      var groups=c.groups;
      var inx=groups.indexOf(g);
      if($scope.isShown(c,g)){
        $scope.showGroup={};
      }else{
        $scope.showGroup.course=c;
        $scope.showGroup.group=g;
      }
        
      if(!g.users || g.users.length===0){
        if(g.status==1)return;
        $offlineData.get_gusers(g.group_id,function(res){
          if(res.data.length===0)return;
          var gro=g;
          var uusers=res.data;
          angular.forEach(uusers, function(v, k){
            uusers[k].roleid= get_role(uusers[k].username);
            uusers[k].context_id= get_context(uusers[k].username);
            uusers[k].uid=uusers[k].id;
            uusers[k].id = k;
          });
          gro.users=uusers;
          groups.splice(inx,1,gro);
          c.groups=groups;
          $scope.ggroups.splice(index,1,c);
          $localStorage.setObject('moodle_groups',$scope.ggroups);
        });
      }
    };

    $scope.isShown=function(css,gg){
      if(($scope.showGroup.group===gg) && ($scope.showGroup.course===css))return true;
      else return false;
    };

    $scope.isSelection=function(css,gg){
      if(($scope.selection.group===gg) && ($scope.selection.course===css))return true;
      else return false;
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

    $scope.myFilter=function(group){
      return group.status!==3;
    };


    $ionicModal.fromTemplateUrl('templates/select_user.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.select_user_modal = modal;
    });

    $scope.show_select_user_modal=function () {
      $scope.select_user_modal.show();
    };

    $scope.hide_select_user_modal=function () {
      $scope.select_user_modal.hide();
    };

    function fetchData() {
    }
  });
