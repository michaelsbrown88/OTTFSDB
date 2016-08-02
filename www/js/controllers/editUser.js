angular.module('editUserController', ['moodleData', 'localStorage'])
  .controller('EditUserCtrl', function($scope, $state, $stateParams, $moodleData, $localStorage, $ionicLoading, $ionicPopup, $ionicViewService,$offlineData, $location, $rootScope){
 
     $scope.census= function(){
        $rootScope.chk = true;
        $location.path('/app/questionnaire');  
    };
    
    
    $scope.$on('$ionicView.beforeEnter', function() {
      // authorize
      $moodleData.authorize();
    });
    

    $scope.$on('$ionicView.afterEnter', function(){
      $scope.user={};
      fetchData();
      $scope.countries = $moodleData.country_list();
      $scope.years = $moodleData.year_list();
      $scope.newPassword = "";



    });
    

    $scope.showLoader = function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="spiral"></ion-spinner><br>Loading'
      });
    };

    $scope.hideLoader = function(){
      $ionicLoading.hide();
    };

    $scope.cancel = function(){
      $state.go('app.users');
    };

    $scope.showAlert = function(message){
      var alertPopup = $ionicPopup.alert({
        title: 'Form Error',
        template: message
      });
    };

    $scope.save = function(){
      // validation
      var ut = /^[0-9a-zA-Z\.\-]+$/;
      if($scope.user.firstname === ""){
        $scope.showAlert('First Name cannot be blank.');
        return;
      }
      if($scope.user.username === ""){
        $scope.showAlert('Username cannot be blank.');
        return;
      }
      if(!ut.test($scope.user.username)){
        $scope.showAlert('Username contains invalid characters.');
        return;
      }
      if ($scope.user.newPassword != null) {
        // change the password
        $scope.user.password = $scope.user.newPassword;
        if ($scope.user.password.length < 8) {
          $scope.showAlert('Password must be at least 8 characters long.');
          return;
        }
        var hasUpperCase = /[A-Z]/.test($scope.user.password);
        var hasLowerCase = /[a-z]/.test($scope.user.password);
        var hasNumbers = /\d/.test($scope.user.password);
        var hasNonalphas = /\W/.test($scope.user.password);
        if (hasUpperCase + hasLowerCase + hasNumbers + hasNonalphas < 4) {
          $scope.showAlert('Password must have at least 1 uppercase, 1 lowercase, 1 number and 1 special character.');
          return;
        }
      }
      if($scope.user.country === ""){
        $scope.showAlert('Country cannot be blank.');
        return;
      }

      var uss=[];
      uss.push($scope.user);
      $offlineData.add_gusers('--','--',uss,function (res) {
        var acts=$scope.user.acts;
        var fflag=true;
        angular.forEach(acts,function (ddd, iii, rrr) {
          if(ddd.status!==0)fflag=false;
        });
        if(fflag){
          $scope.user.status=0;
        }else{
          $scope.user.status=5;
        }
        var users=$localStorage.getItem('moodle_users');
        users.splice($scope.user.id, 1,$scope.user);
        // store the updated users array
        $localStorage.setObject('moodle_users', users);
            $ionicViewService.nextViewOptions({
              disableBack: true
            });
            $state.go('app.users')

      });

      // $moodleData.update_user($scope.user, function(res){
      //   if (res.data === null){
      //     // update the localstorage cache
      //     var users = $localStorage.getObject("users");
      //     for(var i=0; i < users.length; i++){
      //       if(users[i].id === $scope.user.id){
      //         users[i].firstname = $scope.user.firstname;
      //         users[i].lastname = $scope.user.lastname;
      //         users[i].fullname = $scope.user.firstname + ' ' + $scope.user.lastname;
      //         users[i].username = $scope.user.username;
      //         users[i].email = $scope.user.email;
      //         users[i].country = $scope.user.country;
      //         users[i].gender = $scope.user.gender;
      //         $localStorage.setObject("users", users);
      //         break;
      //       }
      //     }
      //     // return to userlist
      //     $ionicViewService.nextViewOptions({
      //       disableBack: true
      //     });
      //     $state.go('app.users')
      //     return;
      //   } else {
      //     $scope.showAlert('Invalid values detected. Please check values and try again.');
      //   }
      // });
    };

    function fetchData(){
      // $scope.showLoader();

      var users=$localStorage.getItem('moodle_users');
      $scope.user=users[$stateParams.id];
      $scope.user.birthyear=parseInt($scope.user.birthyear);
      // angular.forEach(users,function (uu, index, rr) {
      //   if(uu.id===$stateParams.id){
      //     $scope.users=uu;
      //       $scope.hideLoader();
      //       $scope.$broadcast('scroll.refreshComplete');
      //   }
      //
      // });

      // $moodleData.get_user($stateParams.id, function(user){
      //   if(!user.data.exception && user.data.users[0]){
      //     $scope.user = user.data.users[0];
      //     // fetch customfields
      //     angular.forEach($scope.user.customfields, function(v,k){
      //       if($scope.user.customfields[k].shortname === "gender"){
      //         $scope.user.gender = $scope.user.customfields[k].value;
      //       }
      //       if($scope.user.customfields[k].shortname === "birthyear"){
      //         $scope.user.birthyear = $scope.user.customfields[k].value;
      //       }
      //     });
      //   }
      //   $scope.hideLoader();
      //   $scope.$broadcast('scroll.refreshComplete');
      // });
    }

  });
