angular.module('offlineUsersController', ['moodleData', 'localStorage'])
  .controller('OfflineUsersCtrl', function($scope, $state, $moodleData, $localStorage, $ionicLoading, $ionicPopup,$offlineData){

    $scope.$on('$ionicView.afterEnter', function() {
      // fetch initial view data
      $scope.countries = $moodleData.country_list();
      $scope.countryCode=localStorage.getItem('user_country');
      $scope.user_role=localStorage.getItem('moodle_role');
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
    
    $scope.haveNoRights = function(){
        if(localStorage.getItem('moodle_role')==4){
            return true;
        }else{
            return false;
        }
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
          var users = $localStorage.getItem('moodle_users');
          if(user.status===1){
            users.splice(user.id, 1);
          }else{
            user.status=3;
            users.splice(user.id, 1,user);
          }
          $localStorage.setObject('moodle_users', users);
          fetchData();
        }
      });
    };

    $scope.newUser = function(user){
      $state.go('offline.newuser');
    };

    $scope.myFilter=function (user) {
      var flag=true;
      if(user.status===3)flag=false;
      return flag;
    };

    function fetchData(){
      $scope.showLoader();
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
      $scope.hideLoader();
      $scope.$broadcast('scroll.refreshComplete');
    }

  });
