// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular factories
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
function MultiRangeDirective ($compile) {
  var directive = {
    restrict: 'E',
    scope: {
      ngModelMin: '=',
      ngModelMax: '=',
      ngMin: '=',
      ngMax: '=',
      ngStep: '=',
      ngChangeMin: '&',
      ngChangeMax: '&'
    },
    link: link
  };

  return directive;

  ////////////////////

  function link ($scope, $element, $attrs) {
    var min, max, step, $inputMin = angular.element('<input type="range">'), $inputMax;
    $scope.ngChangeMin = $scope.ngChangeMin || angular.noop;
    $scope.ngChangeMax = $scope.ngChangeMax || angular.noop;

    if (typeof $scope.ngMin == 'undefined') {
      min = 0;
    } else {
      min = $scope.ngMin;
      $inputMin.attr('min', min);
    }
    if (typeof $scope.ngMax == 'undefined') {
      max = 0;
    } else {
      max = $scope.ngMax;
      $inputMin.attr('max', max);
    }
    if (typeof $scope.ngStep == 'undefined') {
      step = 0;
    } else {
      step = $scope.ngStep;
      $inputMin.attr('step', step);
    }
    $inputMax = $inputMin.clone();
    $inputMin.attr('ng-model', 'ngModelMin');
    $inputMax.attr('ng-model', 'ngModelMax');
    $compile($inputMin)($scope);
    $compile($inputMax)($scope);
    $element.append($inputMin).append($inputMax);
    $scope.ngModelMin = $scope.ngModelMin || min;
    $scope.ngModelMax = $scope.ngModelMax || max;

    $scope.$watch('ngModelMin', function (newVal, oldVal) {
      if (newVal > $scope.ngModelMax) {
        $scope.ngModelMin = oldVal;
      } else {
        $scope.ngChangeMin();
      }
    });

    $scope.$watch('ngModelMax', function (newVal, oldVal) {
      if (newVal < $scope.ngModelMin) {
        $scope.ngModelMax = oldVal;
      } else {
        $scope.ngChangeMax();
      }
    });
  }
}




angular.module('ottfApp', [
  'ionic',
  'ngCordova',
  'authController',
  'appController',
  'userProfileController',
  'usersController',
  'editUserController',
  'newUserController',
  'offlineController',
  'offlineUsersController',
  'offlineGroupController',
  'offlineNewUserController',
  'offlineEditUserController',
  'uploadController',
  'uploadUsersController',
  'uploadGroupsController',
  'uploadActivityController',
  'analyticsController',
  'offlineActivityControl',
  'offlineTrackerController',
  'activityControl',
  'groupController',
  'questionnaireController'
])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .directive('uiMultiRange', MultiRangeDirective)
  .config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $stateProvider
      .state('signin',{
        url: '/signin',
        controller: 'AuthCtrl',
        templateUrl: 'templates/signin.html'
      })
      .state('app', {
        url: '/app',
        abstract: true,
        controller: 'AppCtrl',
        templateUrl: 'templates/menu.html'
      })
      .state('app.home', {
        url: "/home",
        views: {
          'menuContent': {
            templateUrl: "templates/user_profile.html"
          }
        },
      controller: 'UserProfileCtrl'
      })
    
    //====================
    
     .state('app.questionnaire', {
        url: "/questionnaire",
        views: {
          'menuContent': {
            templateUrl: "templates/questionnaire.html"
          }
        },
        controller: 'questionnaireCtrl'
      })
    
    
    /*
    .state('questioner', {
        url: '/questioner',
        controller: 'questionerCtrl',
        templateUrl: 'templates/questioner.html'
      })*/
    
    
    
    
    
    
    
    //====================
      .state('app.users', {
        url: "/users",
        views: {
          'menuContent': {
            templateUrl: "templates/users.html"
          }
        },
        controller: 'UsersCtrl'
      })
      .state('app.group', {
        url: "/group",
        views: {
          'menuContent': {
            templateUrl: "templates/group.html"
          }
        },
        controller: 'GroupCtrl'
      })
      .state('app.userprofile', {
        url: "/users/:id/profile",
        views: {
          'menuContent': {
            templateUrl: "templates/user_profile.html"
          }
        },
        controller: 'UserProfileCtrl'
      })
      .state('app.edituser', {
        url: "/users/:id/edit",
        views: {
          'menuContent': {
            templateUrl: "templates/edit_user.html"
          }
        },
        controller: 'EditUserCtrl'
      })
      .state('app.newuser', {
        url: "/users/new",
        views: {
          'menuContent': {
            templateUrl: "templates/new_user.html"
          }
        },
        controller: 'NewUserCtrl'
      })
      .state('app.upload', {
        url: "/upload",
        views: {
          'menuContent': {
            templateUrl: "templates/upload.html"
          }
        },
        controller: 'UploadCtrl'
      })


      // .state('app.uploadusers', {
      //   url: "/users/upload",
      //   views: {
      //     'menuContent': {
      //       templateUrl: "templates/upload_users.html"
      //     }
      //   },
      //   controller: 'UploadUsersCtrl'
      // })
      // .state('app.uploadgroups', {
      //   url: "/groups/upload",
      //   views: {
      //     'menuContent': {
      //       templateUrl: "templates/upload_groups.html"
      //     }
      //   },
      //   controller: 'UploadGroupsCtrl'
      // })
      // .state('app.uploadactivity', {
      //   url: "/activity/upload",
      //   views: {
      //     'menuContent': {
      //       templateUrl: "templates/upload_activity.html"
      //     }
      //   },
      //   controller: 'UploadActivityCtrl'
      // })
      .state('app.analytics', {
        url: "/analytics",
        views: {
          'menuContent': {
            templateUrl: "templates/analytics.html"
          }
        },
        controller: 'AnalyticsCtrl'
      })
      .state('app.activity', {
        url: "/activity",
        views: {
          'menuContent': {
            templateUrl: "templates/activity.html"
          }
        },
        controller: 'ActivityCtrl'
      })
      .state('app.tracker', {
        url: "/tracker",
        views: {
          'menuContent': {
            templateUrl: "templates/offline_tracker.html"
          }
        },
        controller: 'OfflineTrackerCtrl'
      })

      // OFFLINE ROUTES
      .state('offline', {
        url: '/offline',
        abstract: true,
        controller: 'OfflineCtrl',
        templateUrl: 'templates/offline_menu.html'
      })
      .state('offline.users', {
        url: "/users",
        views: {
          'menuContent': {
            templateUrl: "templates/offline_users.html"
          }
        },
        controller: 'OfflineUsersCtrl'
      })
      .state('offline.group', {
        url: "/group",
        views: {
          'menuContent': {
            templateUrl: "templates/offline_group.html"
          }
        },
        controller: 'OfflineGroupCtrl'
      })
      .state('offline.activity', {
        url: "/activity",
        views: {
          'menuContent': {
            templateUrl: "templates/offline_activity.html"
          }
        },
        controller: 'OfflineActivityCtrl'
      })
      // .state('offline.tracker', {
      //   url: "/tracker",
      //   views: {
      //     'menuContent': {
      //       templateUrl: "templates/offline_tracker.html"
      //     }
      //   },
      //   controller: 'OfflineTrackerCtrl'
      // })
      .state('offline.newuser', {
        url: "/users/new",
        views: {
          'menuContent': {
            templateUrl: "templates/offline_new_user.html"
          }
        },
        controller: 'OfflineNewUserCtrl'
      })
      .state('offline.edituser', {
        url: "/users/:id/edit",
        views: {
          'menuContent': {
            templateUrl: "templates/offline_edit_user.html"
          }
        },
        controller: 'OfflineEditUserCtrl'
      });

    // default route
    $urlRouterProvider.otherwise("/app/home");
    //$urlRouterProvider.otherwise("/app/questionnaire");
  });
