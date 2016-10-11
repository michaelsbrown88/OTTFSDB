angular.module('authController', ['localStorage', 'moodleData'])
  .controller('AuthCtrl', function($scope, $state, $http, $localStorage, $moodleData, $ionicPopup, $ionicLoading){

    // initialize
    $scope.$on('$ionicView.beforeEnter', function(e) {
      // sign out any previous user
      // $scope.signout();
      // // reset login form
      $scope.user = {};
      var username=$localStorage.getItem('ottfUsername');
      if(username && username.length>0){
        $scope.user.username=username;        
      }else{
        $scope.signout();
      }
    });

    $scope.offlineMode = function(){
      if($scope.user.username){
        console.log('username='+$scope.user.username);
        $state.go('offline.group');
      }else{
        $ionicPopup.alert({
          title: 'Warning',
          template: 'Please Login.'
        });
      }
    };

    $scope.signout = function(){
      $localStorage.set('ottfToken', '');
    };

    $scope.showLoader = function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="spiral"></ion-spinner><br>Authorizing'
      });
    };

    $scope.hideLoader = function(){
      $ionicLoading.hide();
    };

    $scope.authenticate = function(){
      // ignore requests with missing params
      if(!$scope.user.username || !$scope.user.password) {
        return;
      }

        
      function set_role(username){
        $http.get("https://learning.ittfoceania.com/webservice/tg_user_role.php?username=" + username)
        .then(function(response){  
            localStorage.setItem("moodle_role",response.data.role[0].roleid);
        });   
      }
        
      function get_countries(){
        $http.get("https://learning.ittfoceania.com/webservice/tg_country.php").then(function(response){
            $localStorage.setObject('countries',response.data.countries);  
        });
      }

      $scope.showLoader();

      var req = {
        method: 'GET',
        url: 'https://learning.ittfoceania.com/login/token.php',
        params: {
          username: $scope.user.username,
          password: $scope.user.password,
          service: 'ittf_api'
        }
      };
      $http(req).then(
        function successCallback(res) {
          $scope.hideLoader();
          if (res.data.token) {
            // store the token
            $localStorage.set('ottfToken', res.data.token);
            $localStorage.set('ottfUsername', $scope.user.username);
            set_role($scope.user.username);
            get_countries();
            $scope.user = {};
			
            $state.go('app.home');
          } else {
            // moodle auth error
            $ionicPopup.alert({
              title: 'Login Failed',
              template: 'Invalid username or password. Please try again.'
            });
            $scope.user.password = '';
          }
        },
        function errorCallback(res) {

          $scope.hideLoader();
          // moodle comms error
          $ionicPopup.alert({
            title: 'Connection Failed',
            template: 'The server was unreachable. Please check your connection and try again.'
          });
        }
      );
    };

  });
