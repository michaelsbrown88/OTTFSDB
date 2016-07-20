angular.module('offlineEditUserController', ['moodleData', 'localStorage'])
  .controller('OfflineEditUserCtrl', function($scope, $state, $stateParams, $moodleData, $localStorage, $ionicLoading, $ionicPopup, $ionicHistory){

    $scope.$on('$ionicView.beforeEnter', function(){
      $scope.countries = $moodleData.country_list();
      $scope.years = $moodleData.year_list();
    });

    $scope.$on('$ionicView.afterEnter', function(){
      fetchData();
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
      $state.go('offline.users');
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
      // save changes
      $scope.user.fullname = $scope.user.firstname + ' ' + $scope.user.lastname;
      var users = $localStorage.getObject('moodle_users');
      $scope.user.status=2;
      users[$scope.user.id] = $scope.user;
      $localStorage.setObject('moodle_users', users);
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('offline.users');
    };

    function fetchData(){
      $scope.showLoader();
      var users = $localStorage.getObject('moodle_users');
      $scope.user = users[$stateParams.id];


      if (!$scope.user){
        // no user found
        $state.go('offline.users');
      }
      $scope.hideLoader();
    }

  });
