angular.module('questionnaireController', ['localStorage', 'moodleData'])
  .controller('questionnaireCtrl', function($scope, $localStorage, $moodleData,$location,$ionicPopup,$state,$rootScope,$http){
    var chk = $rootScope.chk;
    $scope.input=[];
    
    if(localStorage.getItem('questionnaire')!=undefined){
        if(chk){
            var val1 = localStorage.getItem('questionnaire');
            $scope.input.q1choice = val1.substring(0, 1);
            $scope.input.q2choice = val1.substring(1, 2);
            $scope.input.q3choice = val1.substring(2, 3);
            $scope.input.q4choice = val1.substring(3, 4);
            $scope.input.q5choice = val1.substring(4, 5);
            $scope.input.q6choice = val1.substring(5, 6);
        }else{
            $location.path('/app/home');           
        }
        
    }
    $scope.add= function(){
        
        
        if($scope.input.q1choice ==undefined || $scope.input.q2choice ==undefined || $scope.input.q3choice ==undefined || $scope.input.q4choice ==undefined || $scope.input.q5choice ==undefined  || $scope.input.q6choice ==undefined){
           $ionicPopup.alert({
            title: 'Alert',
            template: 'Please fill the Questionnaire properly.'
          });
           
        }else{
            var answers = $scope.input.q1choice + $scope.input.q2choice + $scope.input.q3choice + $scope.input.q4choice +  $scope.input.q5choice + $scope.input.q6choice;
            localStorage.setItem("questionnaire",answers);
            
            $http.get("https://learning.ittfoceania.com/webservice/tg_add_questionnaire.php?username="  + localStorage.getItem('ottfUsername') + "&answers=" + answers)
            .then(function(){
                
                
            });
            $location.path('/app/home'); 
            
        }
     };


  });
