angular.module('questionnaireController', ['localStorage', 'moodleData'])
  .controller('questionnaireCtrl', function($scope, $localStorage, $moodleData){

   //$scope.test="hello";

    //console.log($scope.test);
  
    
    $scope.input=[];
    $scope.test= function(){
        console.log($scope.input.q1choice);
        console.log($scope.input.q2choice);  
        console.log($scope.input.q3choice);  
        console.log($scope.input.q4choice);  
        console.log($scope.input.q5choice);  
        console.log($scope.input.q6choice); 
        
        
        
        //$scope.input = $scope.input[].;
        $scope.input = localStorage.getItem('result');
        localStorage.setItem("result",$scope.input);
        
      
       
       

    





  
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
             
    };
         


  });
