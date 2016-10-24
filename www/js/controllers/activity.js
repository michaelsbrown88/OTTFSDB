/**
 * Created by Tomas Bujin on 6/19/2016.
 */
angular.module('activityControl', ['offlineData', 'localStorage'])
  .controller('ActivityCtrl', function($scope, $state, $moodleData,$ionicPopup,$localStorage,$offlineData, $ionicLoading,$ionicModal,$rootScope){
    $scope.today=new Date();
    $scope.$on('$ionicView.beforeEnter', function() {
      // fetch initial view data
      $scope.countries = $moodleData.country_list();
      $scope.countryCode='AU';
      $scope.group_trackers=[];
      $scope.user_trackers=[];
      $scope.course=[];
      $scope.selection={};
      $scope.modal={};
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
      $scope.fusers = $localStorage.getItem('offlineUsers');
        
            if(localStorage.getItem('moodle_role')==4 || localStorage.getItem('moodle_role')==5){
                angular.forEach($scope.fusers, function(v, k){
              //console.log($scope.ffusers[k]);
                   if(localStorage.getItem('user_country')!=$scope.fusers[k].country){
                       //console.log(localStorage.getItem('user_country'),$scope.ffusers[k].country)
                       delete $scope.fusers[k];
                   }  
                });   
            }  
              
      $scope.group_trackers=$localStorage.getItem('group_trackers');
      $scope.user_trackers=$localStorage.getItem('user_trackers');
      if($scope.group_trackers.length===0){
        $offlineData.get_activity('group',function(res){
          $scope.group_trackers=res.data;
          var groups=$scope.group_trackers;
          angular.forEach(groups, function(v, k){
            groups[k].status=0;
            groups[k].id = k;
          });
          $scope.group_trackers=groups;
          $localStorage.setObject('group_trackers',groups);
        });
      }
      if($scope.user_trackers.length===0){
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
            
            $localStorage.setObject('offlineUsers',res.data);

            $scope.user_trackers=$scope.fusers;
            $localStorage.setObject('user_trackers',$scope.user_trackers);
          });
        }else{
          $scope.user_trackers=$scope.fusers;
          $localStorage.setObject('user_trackers',$scope.user_trackers);
        }
      }
      if($scope.course.length===0){
        $offlineData.get_course(function(res){
          $scope.course=res.data;
          $localStorage.setObject('offlineCourses',res.data);
        });
      }
    };

    $scope.add_acts=function(course,group){
      var index=$scope.group_trackers.indexOf(course);
      if(!course.groups)course.groups=[];
      var inx=course.groups.indexOf(group);
      $scope.selection.group=group;
      $scope.selection.course=course;
      if(!group.acts){
        $offlineData.get_group_activity(course.course_id,group.group_id,function (res) {
          var data=res.data;
          angular.forEach(data,function (dd, i, arr) {
            data[i].status=0;
          });
          group.acts=data;
          course.groups.splice(inx,1,group);
          $scope.group_trackers.splice(index,1,course);
          $localStorage.setObject('group_trackers',$scope.group_trackers);
        });
      }
    };

    $scope.isActive=function (group) {
      return $scope.selection.group===group;
    };

    $scope.isUserActive=function (user) {
      return $scope.selection.user===user;
    };

    $ionicModal.fromTemplateUrl('templates/activity_create.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.activity_modal = modal;
    });

    $scope.show_modal=function () {
      if(!$scope.selection.group)return;
      $scope.activity_modal.show();
    };

    $scope.show_user_modal=function () {
      if(!$scope.selection.user)return;
      $scope.activity_modal.show();
    };

    $scope.hide_modal=function () {
      $scope.activity_modal.hide();
    };

    $scope.add_course=function (user) {
      var index=$scope.user_trackers.indexOf(user);
      $scope.selection.user=user;

      if(!user.acts){
        $offlineData.get_user_activity(user.uid,function (res) {
          var data=res.data;
          angular.forEach(data,function (dd, i, arr) {
            data[i].status=0;
          });
          user.acts=data;
          $scope.user_trackers.splice(index,1,user);
          $localStorage.setObject('user_trackers',$scope.user_trackers);
        });
      }
    };

    $scope.add_data_confirm=function () {
      if($scope.modal.date.getTime()>$scope.today.getTime()){
        $scope.modal.date=new Date();
        return;
      }
      if(!angular.isNumber($scope.modal.minute)){
        $scope.modal.minute=0;
        return;
      }
      if($scope.layout==='group'){
        var index=$scope.group_trackers.indexOf($scope.selection.course);
        if(!$scope.selection.course.groups)$scope.selection.course.groups=[];
        var inx=$scope.selection.course.groups.indexOf($scope.selection.group);
        $offlineData.add_group_activity($scope.selection.course.course_id,$scope.selection.group.group_id,'--',$scope.modal.date,$scope.modal.minute,function (res) {
          if(!$scope.selection.group.acts)$scope.selection.group.acts=[];
          var att={id:res.data,date:$scope.modal.date,minutes:$scope.modal.minute,status:0};

          $scope.selection.group.acts.push(att);
          $scope.selection.course.groups.splice(inx,1,$scope.selection.group);
          $scope.group_trackers.splice(index,1,$scope.selection.course);
          $localStorage.setObject('group_trackers',$scope.group_trackers);
          $scope.hide_modal();
        });
      }else{
        var index=$scope.user_trackers.indexOf($scope.selection.user);
        if(!$scope.selection.user.acts)$scope.selection.user.acts=[];
		
        $offlineData.add_group_activity($scope.modal.course,'--',$scope.selection.user.uid,$scope.modal.date,$scope.modal.minute,function (res) {
		 
		  if(res.data!="Fail"){
			  if(!$scope.selection.user.acts)$scope.selection.user.acts=[];
			  var fullname='';
			  angular.forEach($scope.course,function (dd, ind, aa) {
				if(dd.course_id===$scope.modal.course){
				  fullname=dd.fullname;
				}
			  });
		 var att={id:res.data,date:$scope.modal.date,minutes:$scope.modal.minute,course_id:$scope.modal.course,course_name:fullname,status:0};
			  $scope.selection.user.acts.push(att);
			  $scope.user_trackers.splice(index,1,$scope.selection.user);
			  $localStorage.setObject('user_trackers',$scope.user_trackers);
			  $scope.hide_modal();
		  }else{
			  
			   window.plugins.toast.showWithOptions(
					{
					  message: "No Permission",
					  duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
					  position: "top",
					  addPixelsY: 40  // added a negative value to move it up a bit (default 0)
					});
				  $scope.hide_modal();	
			   }
		  
        });
      }
    };

    $scope.delete_group_activity=function (course,group,act) {
      var index=$scope.group_trackers.indexOf(course);
      var inx=course.groups.indexOf(group);
      var k=group.acts.indexOf(act);
      $offlineData.delete_group_activity(act.id,function (res) {
        group.acts.splice(k,1);
        course.groups.splice(inx,1,group);
        $scope.group_trackers.splice(index,1,course);
        $localStorage.setObject('group_trackers',$scope.group_trackers);
      });
    };

    $scope.delete_user_activity=function (user,cs) {
      var index=$scope.user_trackers.indexOf(user);
      var inx=user.acts.indexOf(cs);
      $offlineData.delete_group_activity(cs.activity_id,function (res) {
        user.acts.splice(inx,1);
        $scope.user_trackers.indexOf(index,1,user);
        $localStorage.setObject('user_trackers',$scope.user_trackers);
      });
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

    $scope.myFilter=function(group){
      return group.status!==2;
    };

    function fetchData(){
		
    }

  });
