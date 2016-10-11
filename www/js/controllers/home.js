angular.module('homeController', ['localStorage', 'moodleData'])
  .controller('HomeCtrl', function($scope, $localStorage, $moodleData,$location){
    

    $scope.$on('$ionicView.beforeEnter', function() {  
      // authorize
      $moodleData.authorize();
	  
    });

    $scope.$on('$ionicView.afterEnter', function() { 
      // fetch initial view data
      fetchData();
        
    });

    // pull to refresh
    $scope.doRefresh = function(){
      fetchData();
    };

    function fetchData(){
      $scope.user = null;
        
      $moodleData.get_user_by_username($localStorage.get('ottfUsername'), function(res){
        if(res.data.users.length > 0){
          $scope.user = res.data.users[0];
     
          var countryList = $moodleData.country_list();
          angular.forEach(countryList, function(v,k){
            if($scope.user.country === countryList[k].code){
              $scope.user.countryName = countryList[k].name;
            }
          });
          // inject courses
          $moodleData.get_users_courses(res.data.users[0].id, function(res){
          //$moodleData.get_users_courses(418, function(res){
            if(res.data.length > 0){
              $scope.user.courses = res.data;
            }
          });
        }
        $scope.$broadcast('scroll.refreshComplete');
      });

    }

  });
