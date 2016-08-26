/**
 * Created by Tomas Bujin on 5/28/2016.
 */

angular.module('offlineGroupController', ['offlineData', 'localStorage'])
  .controller('OfflineGroupCtrl', function($scope, $state, $moodleData,$ionicPopup,$localStorage,$offlineData, $ionicLoading,$ionicModal){

    $scope.$on('$ionicView.afterEnter', function() {
      // fetch initial view data

      $scope.countryCode=localStorage.getItem('user_country');
      $scope.user_role=localStorage.getItem('moodle_role');
      $scope.token=localStorage.getItem('ottfToken'); 
      $scope.groups=[];
      $scope.fusers=[];

      $scope.users=[];
      $scope.gusers=[];
      $scope.course=[];

      $scope.selection={};
      $scope.showGroup={};

      $scope.offmodal={};
      $scope.read_groups();
    });
    $scope.countries = $moodleData.country_list();

    $scope.layout='group';


    $scope.data={};


    $scope.select_flag=false;
    $scope.select_users=[];
    
    $scope.haveNoRights = function(){
        if(localStorage.getItem('moodle_role')==4){
            return true;
        }else{
            return false;
        }
    };

    $scope.checkViewRights = function(roleid,country){
        if(roleid == undefined || roleid>$scope.user_role){
            if($scope.countryCode==country){
                return true;
            }else{
                 if($scope.user_role<4){
                    return true;
                }else{
                    return false;
                }               
            }
        }else{
            return false;
        }
    };
    
    $scope.checkEditRights = function(roleid,country){
        if(roleid == undefined || roleid>$scope.user_role){
            console.log($scope.countryCode,country);
            if($scope.countryCode==country){
                return true;
                
            }else{
                 if($scope.user_role<3){
                    return true;
                }else{
                    return false;
                }               
            }
        }else{
            return false;
        }
    };
    $scope.read_groups=function(){
      $scope.fusers = $localStorage.getItem('moodle_users');
        
        
    if(localStorage.getItem('moodle_role')==4){
        angular.forEach($scope.ffusers, function(v, k){
              //console.log($scope.ffusers[k]);
               if(localStorage.getItem('user_country')!=$scope.ffusers[k].country){
                   //console.log(localStorage.getItem('user_country'),$scope.ffusers[k].country)
                   delete $scope.ffusers[k];
               }  
          });   
    }
      $scope.groups = $localStorage.getItem('moodle_groups');
      $scope.courses = $localStorage.getItem('moodle_courses');
      if($scope.groups.length===0){
        $offlineData.get_activity('group',function(res){
          $scope.groups=res.data;
          var courses=$scope.groups;
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
          $scope.groups=courses;
          $localStorage.setObject('moodle_groups',courses);
        });
      }
      if($scope.fusers.length===0){
        $offlineData.get_fusers(function(res){
          var ffuser=res.data;
          angular.forEach(ffuser, function(v, k){
            ffuser[k].status = 0;
            ffuser[k].uid=ffuser[k].id;
            ffuser[k].id = k;
            ffuser[k].fullname=ffuser[k].firstname+' '+ffuser[k].lastname;
          });
          $scope.fusers=ffuser;
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
      if($scope.courses.length===0){
        $offlineData.get_course(function(res){
          $scope.courses=res.data;
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
        var index=$scope.groups.indexOf(cs);
        var inx=cs.groups.indexOf(u);
        var courses=$scope.groups;
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
        if(u.status===1){
          groups.splice(inx,1);
        }else{
          u.status=3;
          groups.splice(inx,1,u);
        }

        cs.groups=groups;
        cs.status=1;
        courses.splice(index,1,cs);
        $scope.groups=courses;
        $scope.selection={};
        $localStorage.setObject('moodle_groups',courses);
      });
    };

    $scope.add_group=function(){
      // if(!$scope.selection.course)return;
      $scope.show_group_modal();
    };

    $scope.add_offline_group_confirm=function () {
      var index=-1;

      angular.forEach($scope.groups,function (ccc, kk, arr) {
        if(ccc.course_id===$scope.offmodal.course)index=kk;
      });
      var course;
      if(index===-1){
        angular.forEach($scope.courses,function (cccc, kkkk, aaa) {
          if(cccc.course_id===$scope.offmodal.course)course=cccc;
        })
      }
      course=$scope.groups[index];
       var groups=course.groups;
       var id=groups.length;
       groups.push({id:id,group_name:$scope.offmodal.groupname,status:1,users:[]});
       course.groups=groups;
      course.status=1;
       if(index===-1)$scope.groups.push(course);
       else $scope.groups.splice(index,1,course);
       $localStorage.setObject('moodle_groups',$scope.groups);

      $scope.hide_group_modal();
    };

    $scope.delete_user=function(c,g,u){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm',
        template: 'Are you sure you want to delete users?'
      });

      confirmPopup.then(function(res) {
        var courses=$scope.groups;
        var index=courses.indexOf(c);
        var groups=c.groups;
        var inx=groups.indexOf(g);
        c.status=1;
        var users=g.users;
        var k=users.indexOf(u);
          
          
        if(localStorage.getItem('moodle_role')==4){
            if(u.country == $scope.countryCode){
                console.log('status='+g.status);
                if(g.status===1){
                  users.splice(k,1);
                }else{
                  u.status=3;
                  users.splice(k,1,u);
                  g.status=2;
                }
                g.users=users;
                groups.splice(inx,1,g);

                c.groups=groups;
                courses.splice(index,1,c);

                $localStorage.setObject('moodle_groups',courses);
                $scope.groups=courses;
            }else{
                $ionicPopup.alert({
                     title: 'Alert',
                     template: 'Not permitted'
                   });
            }            
        }else{
            console.log('status='+g.status);
            if(g.status===1){
              users.splice(k,1);
            }else{
              u.status=3;
              users.splice(k,1,u);
              g.status=2;
            }
            g.users=users;
            groups.splice(inx,1,g);

            c.groups=groups;
            courses.splice(index,1,c);

            $localStorage.setObject('moodle_groups',courses);
            $scope.groups=courses;      
            }  
          
      })

    };

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
          var index=$scope.groups.indexOf(course);
          var inx=groups.indexOf(group);
          var ulist=group.users;
          if(!ulist)ulist=[];
          for(var i=0;i<select_users.length;i++){
            var ud=select_users[i];
            ud.id=ulist.length;
            ulist.push(ud);
          }
          group.users=ulist;
          if(group.status!==1)group.status=2;
          groups.splice(inx,1,group);
          course.groups=groups;
          course.status=1;
          $scope.groups.splice(index,1,course);
          $scope.select_users=[];
          $localStorage.setObject('moodle_groups',$scope.groups);
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
        
      if(localStorage.getItem('moodle_role') == 5){
          for(i=0;i<g.users.length;i++){
              if(g.user[i].country != localStorage.getItem("user_country")){
                  g.user.splice(i,1);
              }
          }
      }
        
      $scope.selection.course=c;
      $scope.selection.group=g;
        var index=$scope.groups.indexOf(c);
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
                uusers[k].uid=uusers[k].id;
                uusers[k].id = k;
                uusers[k].roleid= get_role(uusers[k].username);
                uusers[k].context_id= get_context(uusers[k].username);
              });
              gro.users=uusers;
              groups.splice(inx,1,gro);
              c.groups=groups;
              $scope.groups.splice(index,1,c);
              $localStorage.setObject('moodle_groups',$scope.groups);
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
        template: '<ion-spinner icon="spiral"></ion-spinner><br>Downloading, please wait...'
      });
    };

    $scope.hideLoader = function(){
      $ionicLoading.hide();
    };

    $scope.doRefresh = function(){
      fetchData();
    };

    $ionicModal.fromTemplateUrl('templates/offline_group_create.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.group_modal = modal;
    });

    $scope.show_group_modal=function () {
      $scope.group_modal.show();
    };

    $scope.hide_group_modal=function () {
      console.log('12112');
      $scope.group_modal.hide();
    };

    $ionicModal.fromTemplateUrl('templates/offlineSelectUser.html', {
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

    $scope.myFilter=function(group){
      return group.status!==3;
    };

    function fetchData(){
    }

  });
