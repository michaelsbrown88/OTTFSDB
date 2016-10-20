/**
 * Created by Tomas Bujin on 6/2/2016.
 */
angular.module('offlineData', [])
  .factory('$offlineData', ['$http', '$state', '$localStorage', function($http, $state, $localStorage) {

    var moodleHost = 'https://learning.ittfoceania.com';
    //var tokenAuthUrl = moodleHost + '/login/token.php';
    var groupUrl = moodleHost + '/group-overline/index.php';
    var guserUrl=moodleHost+'/group-overline/group_users.php';
    var anayUrl=moodleHost+'/group-overline/group_other.php';
    var courseUrl=moodleHost+'/group-overline/group_course.php';
    return{
      get_groups: function(callback){
        var req = {
          method: 'GET',
          url: groupUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
          // params: {
          //   wstoken: $localStorage.get('ottfToken'),
          //   wsfunction: 'ottf_total_enrolments',
          //   moodlewsrestformat: 'json'
          // }
        };
        $http(req).then(callback);
      },
      delete_group:function(gid,callback){
      var req={
        method:'POST',
        url:groupUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          // 'Content-Type': 'application/json'
        },
        data:{
          action:'del',
          del_group_id:gid
        }
      };
      $http(req).then(callback);
    },
     add_group:function(gname,callback){
		
       var req={
         method:'POST',
         url:groupUrl,
         headers: {
           'Content-Type': 'application/x-www-form-urlencoded'
         },
         data:{
           action:'add',
           add_group_name:gname
		 
         }

       };
       $http(req).then(callback);
     },
      get_gusers:function(gid,callback){
        var req={
          method:'POST',
          url:guserUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'read',
            read_group_id:gid,
            token:$localStorage.get('ottfToken')
          }
        };
        $http(req).then(callback);
      },

      get_fusers:function(callback){
        var req={
          method:'POST',
          //url:guserUrl,
          url:'https://learning.ittfoceania.com/webservice/tg_all_users.php',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'outuser',
            token:$localStorage.get('ottfToken')
          }
        };
        $http(req).then(callback);
      },

      del_gusers:function(gid,users,callback){
        var req={
          method:'POST',
          url:guserUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'del',
            del_group_id:gid,
            join_users:users
          }
        };
        $http(req).then(callback);
      },
      add_gusers:function(gid,gname,users,callback){
        var req={
          method:'POST',
          url:guserUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data:{
            action:'add',
            join_group_id:gid,
            join_group_name:gname,
            join_users:users
          }
        };
        $http(req).then(callback);
      },
	    edit_gusers:function(gid,gname,users,callback){
        var req={
          method:'POST',
          url:guserUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data:{
            action:'edit',
            join_group_id:gid,
            join_group_name:gname,
            join_users:users
          }
        };
        $http(req).then(callback);
      },
      get_analydata:function(gender,max,min,country,callback){
        var req={
          method:'POST',
          url:anayUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'general',
            age:12,
            gender:gender,
            country:country,
            max:max,
            min:min
            // token:$localStorage.get('ottfToken')
          }
        };
        $http(req).then(callback);
      },
      get_gender_analydata:function(gender,callback){
        var req={
          method:'POST',
          url:anayUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'gender',
            data:gender,
            // token:$localStorage.get('ottfToken')
          }
        };
        $http(req).then(callback);
      },
      get_course:function (callback) {
        var req={
          method:'POST',
          url:courseUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'readcourse'
          }
        };
        $http(req).then(callback);
      },
      course_add_group:function(course_id,group_id,user_id,callback){
		 var newusername=$localStorage.get('ottfUsername');
		
        var req={
          method:'POST',
          url:courseUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'addcourse',
            course_id:course_id,
            group_id:group_id,
            user_id:user_id,
			username:newusername
          }
        };
        $http(req).then(callback);
      },
      course_del_group:function (course_id, group_id,callback) {
        var req={
          method:'POST',
          url:courseUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'delcourse',
            course_id:course_id,
            group_id:group_id
          }
        };
        $http(req).then(callback);
      },
      get_activity:function (type,callback) {
		     var newusername=$localStorage.get('ottfUsername');
		 
        var req={
          method:'POST',
          url:courseUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'readcoursegroup',
            type:type,
			username:newusername
          }
        };
        $http(req).then(callback);
      },
      get_group_activity:function (course_id,group_id,callback) {
        var req={
          method:'POST',
          url:courseUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'readactivity',
            course_id:course_id,
            group_id:group_id
          }
        };
        $http(req).then(callback);
      },
      add_group_activity:function (course_id,group_id,user_id,date,minute,callback) {
		 
        var req={
          method:'POST',
          url:courseUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'addactivity',
            course_id:course_id,
            group_id:group_id,
            user_id:user_id,
            date:date,
            minutes:minute
          }
        };
        $http(req).then(callback);
      },
      delete_group_activity:function (activity_id,callback) {
        var req={
          method:'POST',
          url:courseUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // 'Content-Type': 'application/json'
          },
          data:{
            action:'delactivity',
            activity_id:activity_id
          }
        };
        $http(req).then(callback);
      },
      get_user_activity:function (user_id,callback) {
        var req={
          method:'POST',
          url:courseUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            //'Content-Type': 'application/json'
          },
          data:{
            action:'readactivity',
            user_id:user_id,
            group_id:'--'
          }
        };
        $http(req).then(callback);
      }
    }
  }]);
