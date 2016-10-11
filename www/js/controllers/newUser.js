angular.module('newUserController', ['moodleData', 'localStorage'])
  .controller('NewUserCtrl', function($scope, $state, $moodleData,$ionicLoading, $localStorage, $ionicPopup, $ionicViewService,$offlineData,$http){
    $scope.countryCode=localStorage.getItem('user_country');
    $scope.$on('$ionicView.beforeEnter', function() {
      // authorize
      $moodleData.authorize();
    });

    $scope.$on('$ionicView.afterEnter', function(){
		
      $scope.countries = $moodleData.country_list();
      $scope.years = $moodleData.year_list();
      $scope.user = {
        firstname: "",
        lastname: "",
        username: "",
        password: "Secur3$$",
        email: "",
        country: localStorage.getItem('user_country'),
        gender: "",
		smashdownbarriers:'0'
      };
        
    });

    $scope.cancel = function(){
      $state.go('app.users');
    };

    $scope.showAlert = function(message){
      var alertPopup = $ionicPopup.alert({
        title: 'Form Error',
        template: message
      });
    };

    
    $scope.haveNoRights = function(){
        if(localStorage.getItem('moodle_role')==4){
            return true;
        }else{
            return false;
        }
    };
    
    $scope.check_username = function(){
      $http.get("https://learning.ittfoceania.com/webservice/tg_check_username.php?username=" + $scope.user.firstname.substr(0, 1) + $scope.user.lastname)
      .then(function(response){
            $scope.user.username = response.data.username[0].value.toLowerCase();  
      });  
    };

    $scope.save = function(){
      // validation
      var ut = /^[0-9a-zA-Z\.\-]+$/;
      var et = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
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
	 
	 /* if($scope.isChecked==true){alert($scope.isChecked);
		  $scope.user.smashdownbarriers ='1';
	  }else{alert($scope.isChecked+"eeeeeeee");
		  $scope.user.smashdownbarriers ='0'; 
		}*/
	
      if($scope.user.password.length < 8){
        $scope.showAlert('Password must be at least 8 characters long.');
        return;
      }
      var hasUpperCase = /[A-Z]/.test($scope.user.password);
      var hasLowerCase = /[a-z]/.test($scope.user.password);
      var hasNumbers = /\d/.test($scope.user.password);
      var hasNonalphas = /\W/.test($scope.user.password);
      if (hasUpperCase + hasLowerCase + hasNumbers + hasNonalphas < 4){
        $scope.showAlert('Password must have at least 1 uppercase, 1 lowercase, 1 number and 1 special character.');
        return;
      }
  /*    if(!et.test($scope.user.email)){
        $scope.showAlert('Email address not valid.');
        return;
      }*/
      if($scope.user.country === ""){
        $scope.showAlert('Country cannot be blank.');
        return;
      }
        
      /* $moodleData.create_user($scope.user, function(res){
        console.log(res);
        if (res.data.errorcode){
          $scope.showAlert(res.data.message);
        } else {
          // update the cache
          var users = $localStorage.getObject("users");
          if (users){
            $moodleData.get_user(res.data[0].id, function(user){
             if(!user.data.exception && user.data.users[0]){
                 users.push(user.data.users[0]);
                $localStorage.setObject("users", users);
             }
            });
          }
          // return to userlist
          $ionicViewService.nextViewOptions({
            disableBack: true
          });
          $state.go('app.users');
           return;
        }
      });*/
	  
      var uss=[];
      var uuser=$scope.user;
      uuser.uid='--';
      uss.push(uuser);
	  $ionicLoading.show({
        template: '<ion-spinner icon="spiral"></ion-spinner><br>Save...'
      });
      $offlineData.add_gusers('--','--',uss,function (res) { 
	   $ionicLoading.hide();
        uuser.uid=res.data[0].id;
        uuser.status=0;
        uuser.fullname=uuser.firstname+' '+uuser.lastname;
        var fusers=$localStorage.getItem('moodle_users');
        uuser.id=fusers.length;
        fusers.push(uuser);
        $localStorage.setObject('moodle_users',fusers);

            $ionicViewService.nextViewOptions({
              disableBack: true
            });
            $state.go('app.users');
            return;
        // fetchData();
      });
    };

  });
