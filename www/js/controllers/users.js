angular.module('usersController', ['moodleData', 'localStorage'])
  .controller('UsersCtrl', function($scope, $state, $moodleData, $localStorage, $ionicLoading,$offlineData){

    $scope.$on('$ionicView.beforeEnter', function() {
      // authorize
      $moodleData.authorize();
    });

    $scope.$on('$ionicView.afterEnter', function() {
      // fetch initial view data

      // if(!$localStorage.get('users')){
      //   // get network users
        fetchData();
      // } else {
      //   // use local user cache
      //   $scope.users = $localStorage.getObject('moodle_users');
      // }
      $scope.countries = $moodleData.country_list();

      $scope.country={};
      $scope.countryCode=localStorage.getItem('user_country');
      $scope.user_role=localStorage.getItem('moodle_role');
     $scope.token=localStorage.getItem('ottfToken'); 
        
       

    });
    
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
          //  console.log($scope.countryCode,country);
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
    
    $scope.haveNoRights = function(){
        if(localStorage.getItem('moodle_role')==4){
            return true;
        }else{
            return false;
        }
    };

    $scope.showLoader = function() {
      $ionicLoading.show({
        noBackdrop: true,
        template: '<ion-spinner icon="spiral"></ion-spinner><br>Downloading users, please wait...'
      });
    };

    $scope.hideLoader = function(){
      $ionicLoading.hide();
    };

    $scope.doRefresh = function(){
      fetchData();
    };

    $scope.edit = function(user){
      $state.go('app.edituser', {id: user.id});
    };

    $scope.profile = function(user){
      $state.go('app.userprofile', {id: user.id});
    };

    $scope.newUser = function(user){
      $state.go('app.newuser');
    };

    function fetchData(){
      // $scope.showLoader();

      $scope.users = $localStorage.getItem('moodle_users');
 
		
      if($scope.users.length===0){
        $offlineData.get_fusers(function(res){
          var users=res.data;
          angular.forEach(users, function(v, k){
            users[k].uid=users[k].id;
            users[k].id = k;
            users[k].status = 0;
            users[k].fullname=users[k].firstname+' '+users[k].lastname;
          });
            
          $scope.users=users;
          $localStorage.setObject('moodle_users',users);
        });
      }

        
      // $moodleData.get_users(0, 0, function(users){
      //   if(!users.data.exception){
      //     // $localStorage.setObject('users', users.data.users);
      //        $scope.users = users.data.users;
      //   }
      //     $scope.hideLoader();
      //     $scope.$broadcast('scroll.refreshComplete');
      // });
	  
    }

  });
