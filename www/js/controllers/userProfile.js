angular.module('userProfileController', ['localStorage', 'moodleData'])
  .controller('UserProfileCtrl', function($scope, $stateParams, $localStorage, $moodleData,$cordovaCamera,$cordovaFileTransfer,$state,$offlineData,$http,$location,$rootScope,$cordovaImagePicker,$ionicModal){
    
      $scope.fromCamera = true;
    
      $ionicModal.fromTemplateUrl('templates/selectPhoto.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });

    
    $scope.setCamera = function(value){
        console.log(value);
        $scope.fromCamera = value;
        $scope.modal.hide();
        takePic();
    };
    $scope.modalClose = function(){
        $scope.modal.hide();
    };
    
    $scope.uploadPic =  function(){
        $scope.modal.show();     
    };
    
    function takePic(){
        if($scope.fromCamera){    
            var options = {
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.CAMERA,
            };

            $cordovaCamera.getPicture(options).then(function(imageURI) {
                uploadImage(imageURI);

            }, function(err) {
               console.log(err);
            });
            
        }else{
          var options = {
           maximumImagesCount: 1
          };

          $cordovaImagePicker.getPictures(options)
            .then(function (results) {
             
                uploadImage(results[0]);
            }, function(error) {
              // error getting photos
            });
        }        
    }
    
    function uploadImage(imageURI){
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
      console.log(imageURI);
        console.log(filename);
      $cordovaFileTransfer.upload("https://learning.ittfoceania.com/webservice/tg_pic_upload.php",imageURI , options,true)
          .then(function(result) {

          }, function(err) {
            console.log(err);
          }, function (progress) {
            // constant progress updates
          });          
    }
    
    $scope.census= function(){
        $rootScope.chk = true;
        $location.path('/app/questionnaire');  
    };
    
    
    $scope.editProfile = function(){
        var user_id = 0;
        var offUsers = $localStorage.getObject('offlineUsers');
        for(i=0;i<offUsers.length;i++){
            if(offUsers[i].uid == $scope.user.id ){
                user_id = offUsers[i].id;
            }
        }
        
        $state.go("app.edituser", {id:user_id});
    };
    
    $scope.$on('$ionicView.beforeEnter', function() {
      // authorize
      $moodleData.authorize();
    });

    $scope.$on('$ionicView.afterEnter', function() {
      // fetch initial view data
      fetchData();
      if(localStorage.getItem('questionnaire')==undefined){
          $location.path('/app/questionnaire');  
      }
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

      } else {
 
        // fetch the logged in user
        $moodleData.get_user_by_username($localStorage.get('ottfUsername'), function(res){
          if(res.data.users && res.data.users.length > 0){
            $scope.user = res.data.users[0];
            //console.log($localStorage.getItem("country"));
            if(localStorage.getItem("user_country")==undefined){
                localStorage.setItem("user_country",$scope.user.country);
            }
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
