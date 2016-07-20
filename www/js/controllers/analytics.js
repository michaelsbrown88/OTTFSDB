angular.module('analyticsController', ['localStorage', 'moodleData','offlineData'])
  .controller('AnalyticsCtrl', function($scope,$ionicModal, $localStorage, $moodleData,$offlineData){

    $scope.$on('$ionicView.beforeEnter', function() {
      // authorize
      $moodleData.authorize();
    });

    $scope.$on('$ionicView.afterEnter', function() {
      // fetch initial view data
      $scope.countries = $moodleData.country_list();
      fetchData();
    });

    $scope.ageMin = 1;
    $scope.ageMax = 100;
    $scope.range = {
      from: 1,
      to: 100
    };

    $scope.data={};
    $scope.data.gender='M';
    $scope.data.countryCode='AU';

    $scope.showFlag=false;

    // pull to refresh
    $scope.doRefresh = function(){
      // fetchData();
    };
    $scope.somethingHasChanged = function () {
      // console.log('change!', $scope.range);

    };

    $scope.swipe=function () {
      $scope.showFlag=!$scope.showFlag;
    };

    $ionicModal.fromTemplateUrl('templates/filter.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.show_filter=function () {
      $scope.modal.show();
    };

    $scope.close=function () {
      $scope.modal.hide();
    };

    $scope.isShow=function () {
      return $scope.showFlag;
    };


    $scope.search=function(){
      var date=new Date();
      $offlineData.get_analydata('M',date.getFullYear()-$scope.range.from,date.getFullYear()-$scope.range.to,$scope.data.countryCode,function (res) {
        if(!res.data.exception){
          $scope.data.male_participants=res.data[0][0].generalcount;
          $scope.data.male_hours=res.data[0][0].total_hours;
          if(!$scope.data.male_hours)$scope.data.male_hours=0;
          if(!$scope.data.male_participants)$scope.data.male_participants=0;
        }
      });

      $offlineData.get_analydata('F',date.getFullYear()-$scope.range.from,date.getFullYear()-$scope.range.to,$scope.data.countryCode,function (res) {
        if(!res.data.exception){
          $scope.data.female_participants=res.data[0][0].generalcount;
          $scope.data.female_hours=res.data[0][0].total_hours;
          if(!$scope.data.female_hours)$scope.data.female_hours=0;
          if(!$scope.data.female_participants)$scope.data.female_participants=0;

          $scope.enrolments=parseInt($scope.data.male_participants)+parseInt($scope.data.female_participants);
          $scope.hours=parseInt($scope.data.male_hours)+parseInt($scope.data.female_hours);
        }
      });



      $scope.close();
    };

    $scope.fetch=function(){
      fetchData();
      $scope.close();
    }

    function fetchData(){
      $scope.enrolments = null;
      $scope.country_count = null;
      $scope.hours = null;

      $moodleData.total_enrolments(function(enrolments){
        if(!enrolments.data.exception){
          $scope.enrolments = enrolments.data;
        }
      });

      $moodleData.total_countries(function(countries){
        if(!countries.data.exception){
          $scope.country_count = countries.data;
        }
      });

      $moodleData.total_hours(function(hours){
        if(!hours.data.exception){
          $scope.hours = hours.data;
        }
      });

      $offlineData.get_gender_analydata('M',function(data){
        if(!data.data.exception){
          console.log(JSON.stringify(data.data[0]));
          $scope.data.male_participants = data.data[0][0].gendercount;
          $scope.data.male_hours = data.data[1][0].total_hours;

        }
      });

      $offlineData.get_gender_analydata('F',function(data){
        if(!data.data.exception){
          $scope.data.female_participants = data.data[0][0].gendercount;
          $scope.data.female_hours = data.data[1][0].total_hours;
        }
      });

      $scope.$broadcast('scroll.refreshComplete');

    }

  });
