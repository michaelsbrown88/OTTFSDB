angular.module('offlineNewUserController', ['moodleData', 'localStorage'])
  .controller('OfflineNewUserCtrl', function($scope, $state, $moodleData, $localStorage, $ionicPopup, $ionicHistory, $http){
    $scope.countryCode=localStorage.getItem('user_country');
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
        status:1,
        customfields: [{},{value: ""}]
      }
    });

    $scope.cancel = function(){
      $state.go('offline.users');
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
        var str = $scope.user.firstname.substr(0,1) + $scope.user.lastname;
        $scope.user.username =str.toLowerCase()
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
     /* if(!et.test($scope.user.email)){
        $scope.showAlert('Email address not valid.');
        return;
      }*/
      if($scope.user.country === ""){
        $scope.showAlert('Country cannot be blank.');
        return;
      }
      // inject calculated fields
      $scope.user.fullname = $scope.user.firstname + ' ' + $scope.user.lastname;

      var users = $localStorage.getObject("moodle_users");
      if (users.length > 0){
        // set user id to array index
        $scope.user.id = users.length;
        users.push($scope.user);
        $localStorage.setObject("moodle_users", users);
      } else {
        // set user id as first array index
        $scope.user.id = 0;
        $localStorage.setObject("moodle_users", [$scope.user]);
      }

      // return to userlist
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('offline.users');
    };

  });
