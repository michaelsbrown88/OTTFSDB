angular.module('userProfileController', ['localStorage', 'moodleData'])
  .controller('UserProfileCtrl', function($scope, $stateParams, $localStorage, $moodleData,$cordovaCamera,$cordovaFileTransfer){

    $scope.uploadPic =  function(){

        var options = {
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
        };

        $cordovaCamera.getPicture(options).then(function(imageURI) {
          var temp = imageURI.split("/");
          var filename = temp[temp.length - 1];
          
          var myImage = document.getElementById('myImage');
          myImage.src = imageURI;
            
          var options = {
                 fileKey: "file",
                 fileName: filename,
                 chunkedMode: false,
                 mimeType: "image/jpg",
                 params : {'user':$scope.user.id}
             };

          $cordovaFileTransfer.upload("https://learning.ittfoceania.com/webservice/tg_pic_upload.php",imageURI , options,true)
              .then(function(result) {

              }, function(err) {
                console.log(err);
              }, function (progress) {
                // constant progress updates
              });  
        
            
            
            
        }, function(err) {
          // error
        });

    };
    
    
    
    
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

      if($stateParams.id){
        var users=$localStorage.getItem('moodle_users');
        $scope.user=users[$stateParams.id];
        var countryList = $moodleData.country_list();
        angular.forEach(countryList, function(v,k){
           if($scope.user.country === countryList[k].code){
             $scope.user.countryName = countryList[k].name;
           }
        });

        console.log(JSON.stringify($scope.user));
        // inject courses
        $scope.user.totalGrades = 0;

        $moodleData.get_users_courses($scope.user.uid, function(res){
          if(res.data.length > 0){
            $scope.user.courses = res.data;
            // get grades
            angular.forEach(res.data, function(v,k){
              $moodleData.get_user_course_grades($scope.user.uid, v.id, function(grade){
                if(!grade.data.exception){
                  $scope.user.courses[k].grades = grade.data.items[0].grades[0];
                  $scope.user.totalGrades += grade.data.items[0].grades[0].grade;
                }
              });
            });
          }
        });
        // fetch the chosen user
        // $moodleData.get_user($stateParams.id, function(res){
        //   if(res.data.users.length > 0){
        //     $scope.user = res.data.users[0];
        //     // inject country name
        //     var countryList = $moodleData.country_list();
        //     angular.forEach(countryList, function(v,k){
        //       if($scope.user.country === countryList[k].code){
        //         $scope.user.countryName = countryList[k].name;
        //       }
        //     });
        //     // inject courses
        //     $scope.user.totalGrades = 0;
        //     $moodleData.get_users_courses(res.data.users[0].id, function(res){
        //       if(res.data.length > 0){
        //         $scope.user.courses = res.data;
        //         // get grades
        //         angular.forEach(res.data, function(v,k){
        //           $moodleData.get_user_course_grades($scope.user.id, v.id, function(grade){
        //             if(!grade.data.exception){
        //               $scope.user.courses[k].grades = grade.data.items[0].grades[0];
        //               $scope.user.totalGrades += grade.data.items[0].grades[0].grade;
        //             }
        //           });
        //         });
        //       }
        //     });
        //   }
        //
        //
        //   $scope.$broadcast('scroll.refreshComplete');
        // });

      } else {

        // fetch the logged in user
        $moodleData.get_user_by_username($localStorage.get('ottfUsername'), function(res){
          if(res.data.users && res.data.users.length > 0){
            $scope.user = res.data.users[0];
            // inject country name
            var countryList = $moodleData.country_list();
            angular.forEach(countryList, function(v,k){
              if($scope.user.country === countryList[k].code){
                $scope.user.countryName = countryList[k].name;
              }
            });
              
            // console.log($scope.user);
            // inject courses
            $scope.user.totalGrades = 0;
            $moodleData.get_users_courses(res.data.users[0].id, function(res){
              if(res.data.length > 0){
                $scope.user.courses = res.data;
                // get grades
                angular.forEach(res.data, function(v,k){
                  $moodleData.get_user_course_grades($scope.user.id, v.id, function(grade){
                    if(!grade.data.exception){
                      $scope.user.courses[k].grades = grade.data.items[0].grades[0];
                      $scope.user.totalGrades += grade.data.items[0].grades[0].grade;
                    }
                  });
                });
              }
            });
          }
          $scope.$broadcast('scroll.refreshComplete');
        });

      }

    }

  });
