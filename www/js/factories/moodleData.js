/* Factory for communitating with the Moodle REST API */

angular.module('moodleData', [])
  .factory('$moodleData', ['$http', '$state', '$localStorage', function($http, $state, $localStorage) {

    var moodleHost = 'https://learning.ittfoceania.com';
    //var tokenAuthUrl = moodleHost + '/login/token.php';
    var webServiceUrl = moodleHost + '/webservice/rest/server.php';
    //var restServiceName = 'ittf_api';

    return {
      authorize: function(admin){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'ottf_authorize',
            moodlewsrestformat: 'json'
          }
        };
        $http(req).then(function successCallback(res){
          if(admin){
            // needs admin
            if(res.data.admin != "true"){
              $state.go('signin');
              return false;
            } else {
              return true;
            }
          } else {
            // does not need admin
            if(res.data.auth != "true"){
              $state.go('signin');
              return false;
            }
          }
          return true;
        }, function errorCallback(){
          $state.go('signin');
          return false;
        });
      },
      total_enrolments: function(callback){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'ottf_total_enrolments',
            moodlewsrestformat: 'json'
          }
        };
        $http(req).then(callback);
      },
      total_countries: function(callback){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'ottf_total_countries',
            moodlewsrestformat: 'json'
          }
        };
        $http(req).then(callback);
      },
      total_hours: function(callback){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'ottf_total_hours',
            moodlewsrestformat: 'json'
          }
        };
        $http(req).then(callback);
      },
      get_users: function(offset, pagesize, callback){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'ottf_get_users',
            moodlewsrestformat: 'json',
            offset: offset,
            pagesize: pagesize,
            "criteria[0][key]": 'null',
            "criteria[0][value]": 'null'
          }
        };
        $http(req).then(
          function(res){
            if(res.data.users.length > 0) {
              // fix the profileimageurl
              res.data.users.map(function(item,index){
                item.profileimageurl = item.profileimageurl.replace('pluginfile.php', 'webservice/pluginfile.php') + '?token=' + $localStorage.get('ottfToken');
              });
            }
            callback(res);
          }
        );
      },

      get_groups:function(){

        var url='';

        var req = {
          method: 'GET',
          url: url
          // params: {
          //   // wstoken: $localStorage.get('ottfToken'),
          //   // wsfunction: 'ottf_get_users',
          //   // moodlewsrestformat: 'json',
          //   // offset: offset,
          //   // pagesize: pagesize,
          //   // "criteria[0][key]": 'null',
          //   // "criteria[0][value]": 'null'
          // }
        };
        $http(req).then(
          function(res){
            // if(res.data.users.length > 0) {
            //   // fix the profileimageurl
            //   res.data.users.map(function(item,index){
            //     item.profileimageurl = item.profileimageurl.replace('pluginfile.php', 'webservice/pluginfile.php') + '?token=' + $localStorage.get('ottfToken');
            //   });
            // }
            callback(res);
          }
        );
      },
      get_user: function(id, callback){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'ottf_get_users',
            moodlewsrestformat: 'json',
            "criteria[0][key]": 'id',
            "criteria[0][value]": id
          }
        };
        $http(req).then(
          function(res){
            if(res.data.users && res.data.users.length > 0) {
              // fix the profileimageurl
              res.data.users.map(function(item,index){
                item.profileimageurl = item.profileimageurl.replace('pluginfile.php', 'webservice/pluginfile.php') + '?token=' + $localStorage.get('ottfToken');
              });
            }
            callback(res);
          }
        );
      },
      get_user_by_username: function(username, callback){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'ottf_get_users',
            moodlewsrestformat: 'json',
            "criteria[0][key]": 'username',
            "criteria[0][value]": username
          }
        };
        $http(req).then(
          function(res){
            if(res.data.users && res.data.users.length > 0) {
              // fix the profileimageurl
              res.data.users.map(function(item,index){
                item.profileimageurl = item.profileimageurl.replace('pluginfile.php', 'webservice/pluginfile.php') + '?token=' + $localStorage.get('ottfToken');
              });
            }
            callback(res);
          }
        );
      },
      get_users_courses: function(id, callback){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'core_enrol_get_users_courses',
            moodlewsrestformat: 'json',
            "userid": id
          }
        };
        $http(req).then(callback);
      },
      get_user_course_grades: function(userid, courseid, callback){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'core_grades_get_grades',
            moodlewsrestformat: 'json',
            "userids[0]": userid,
            courseid: courseid
          }
        };
        $http(req).then(callback);
      },
      update_user: function(user, callback){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'core_user_update_users',
            moodlewsrestformat: 'json',
            "users[0][id]": user.id,
            "users[0][username]": user.username,
            "users[0][firstname]": user.firstname,
            "users[0][lastname]": user.lastname,
            "users[0][email]": user.email,
            "users[0][country]": user.country,
            "users[0][customfields][0][type]": "gender",
            "users[0][customfields][0][value]": user.gender,
            "users[0][customfields][1][type]": "birthyear",
            "users[0][customfields][1][value]": user.birthyear
          }
        };
        if (user.password != null){
          req.params["users[0][password]"] = user.password;
        }
        $http(req).then(callback);
      },
      create_user: function(user, callback){
        var req = {
          method: 'GET',
          url: webServiceUrl,
          params: {
            wstoken: $localStorage.get('ottfToken'),
            wsfunction: 'core_user_create_users',
            moodlewsrestformat: 'json',
            "users[0][username]": user.username,
            "users[0][password]": user.password,
            "users[0][firstname]": user.firstname,
            "users[0][lastname]": user.lastname,
            "users[0][email]": user.email,
            "users[0][country]": user.country,
            "users[0][customfields][0][type]": "gender",
            "users[0][customfields][0][value]": user.gender,
            "users[0][customfields][1][type]": "birthyear",
            "users[0][customfields][1][value]": user.birthyear
          }
        };
        $http(req).then(callback);
      },
     /* country_list: function(callback){
        var req = {
          method: 'GET',
          url: "https://learning.ittfoceania.com/webservice/tg_country.php",
        };
        $http(req).then(callback);
      }, 
    */
     country_list: function(){
        return $localStorage.getObject('countries');
      },
        
     /* country_list: function(){
        var countries = [
          {"code": 'AD', "name": 'Andorra'},
          {"code": 'AE', "name": 'United Arab Emirates'},
          {"code": 'AF', "name": 'Afghanistan'},
          {"code": 'AG', "name": 'Antigua And Barbuda'},
          {"code": 'AI', "name": 'Anguilla'},
          {"code": 'AL', "name": 'Albania'},
          {"code": 'AM', "name": 'Armenia'},
          {"code": 'AO', "name": 'Angola'},
          {"code": 'AQ', "name": 'Antarctica'},
          {"code": 'AR', "name": 'Argentina'},
          {"code": 'AS', "name": 'American Samoa'},
          {"code": 'AT', "name": 'Austria'},
          {"code": 'AU', "name": 'Australia'},
          {"code": 'AW', "name": 'Aruba'},
          {"code": 'AX', "name": 'Åland Islands'},
          {"code": 'AZ', "name": 'Azerbaijan'},
          {"code": 'BA', "name": 'Bosnia And Herzegovina'},
          {"code": 'BB', "name": 'Barbados'},
          {"code": 'BD', "name": 'Bangladesh'},
          {"code": 'BE', "name": 'Belgium'},
          {"code": 'BF', "name": 'Burkina Faso'},
          {"code": 'BG', "name": 'Bulgaria'},
          {"code": 'BH', "name": 'Bahrain'},
          {"code": 'BI', "name": 'Burundi'},
          {"code": 'BJ', "name": 'Benin'},
          {"code": 'BL', "name": 'Saint Barthélemy'},
          {"code": 'BM', "name": 'Bermuda'},
          {"code": 'BN', "name": 'Brunei Darussalam'},
          {"code": 'BO', "name": 'Bolivia, Plurinational State Of'},
          {"code": 'BQ', "name": 'Bonaire, Sint Eustatius And Saba'},
          {"code": 'BR', "name": 'Brazil'},
          {"code": 'BS', "name": 'Bahamas'},
          {"code": 'BT', "name": 'Bhutan'},
          {"code": 'BV', "name": 'Bouvet Island'},
          {"code": 'BW', "name": 'Botswana'},
          {"code": 'BY', "name": 'Belarus'},
          {"code": 'BZ', "name": 'Belize'},
          {"code": 'CA', "name": 'Canada'},
          {"code": 'CC', "name": 'Cocos (Keeling) Islands'},
          {"code": 'CD', "name": 'Congo, The Democratic Republic Of The'},
          {"code": 'CF', "name": 'Central African Republic'},
          {"code": 'CG', "name": 'Congo'},
          {"code": 'CH', "name": 'Switzerland'},
          {"code": 'CI', "name": 'Côte D\'Ivoire'},
          {"code": 'CK', "name": 'Cook Islands'},
          {"code": 'CL', "name": 'Chile'},
          {"code": 'CM', "name": 'Cameroon'},
          {"code": 'CN', "name": 'China'},
          {"code": 'CO', "name": 'Colombia'},
          {"code": 'CR', "name": 'Costa Rica'},
          {"code": 'CU', "name": 'Cuba'},
          {"code": 'CV', "name": 'Cabo Verde'},
          {"code": 'CW', "name": 'Curaçao'},
          {"code": 'CX', "name": 'Christmas Island'},
          {"code": 'CY', "name": 'Cyprus'},
          {"code": 'CZ', "name": 'Czech Republic'},
          {"code": 'DE', "name": 'Germany'},
          {"code": 'DJ', "name": 'Djibouti'},
          {"code": 'DK', "name": 'Denmark'},
          {"code": 'DM', "name": 'Dominica'},
          {"code": 'DO', "name": 'Dominican Republic'},
          {"code": 'DZ', "name": 'Algeria'},
          {"code": 'EC', "name": 'Ecuador'},
          {"code": 'EE', "name": 'Estonia'},
          {"code": 'EG', "name": 'Egypt'},
          {"code": 'EH', "name": 'Western Sahara'},
          {"code": 'ER', "name": 'Eritrea'},
          {"code": 'ES', "name": 'Spain'},
          {"code": 'ET', "name": 'Ethiopia'},
          {"code": 'FI', "name": 'Finland'},
          {"code": 'FJ', "name": 'Fiji'},
          {"code": 'FK', "name": 'Falkland Islands (Malvinas)'},
          {"code": 'FM', "name": 'Micronesia, Federated States Of'},
          {"code": 'FO', "name": 'Faroe Islands'},
          {"code": 'FR', "name": 'France'},
          {"code": 'GA', "name": 'Gabon'},
          {"code": 'GB', "name": 'United Kingdom'},
          {"code": 'GD', "name": 'Grenada'},
          {"code": 'GE', "name": 'Georgia'},
          {"code": 'GF', "name": 'French Guiana'},
          {"code": 'GG', "name": 'Guernsey'},
          {"code": 'GH', "name": 'Ghana'},
          {"code": 'GI', "name": 'Gibraltar'},
          {"code": 'GL', "name": 'Greenland'},
          {"code": 'GM', "name": 'Gambia'},
          {"code": 'GN', "name": 'Guinea'},
          {"code": 'GP', "name": 'Guadeloupe'},
          {"code": 'GQ', "name": 'Equatorial Guinea'},
          {"code": 'GR', "name": 'Greece'},
          {"code": 'GS', "name": 'South Georgia And The South Sandwich Islands'},
          {"code": 'GT', "name": 'Guatemala'},
          {"code": 'GU', "name": 'Guam'},
          {"code": 'GW', "name": 'Guinea-Bissau'},
          {"code": 'GY', "name": 'Guyana'},
          {"code": 'HK', "name": 'Hong Kong'},
          {"code": 'HM', "name": 'Heard Island And Mcdonald Islands'},
          {"code": 'HN', "name": 'Honduras'},
          {"code": 'HR', "name": 'Croatia'},
          {"code": 'HT', "name": 'Haiti'},
          {"code": 'HU', "name": 'Hungary'},
          {"code": 'ID', "name": 'Indonesia'},
          {"code": 'IE', "name": 'Ireland'},
          {"code": 'IL', "name": 'Israel'},
          {"code": 'IM', "name": 'Isle Of Man'},
          {"code": 'IN', "name": 'India'},
          {"code": 'IO', "name": 'British Indian Ocean Territory'},
          {"code": 'IQ', "name": 'Iraq'},
          {"code": 'IR', "name": 'Iran, Islamic Republic Of'},
          {"code": 'IS', "name": 'Iceland'},
          {"code": 'IT', "name": 'Italy'},
          {"code": 'JE', "name": 'Jersey'},
          {"code": 'JM', "name": 'Jamaica'},
          {"code": 'JO', "name": 'Jordan'},
          {"code": 'JP', "name": 'Japan'},
          {"code": 'KE', "name": 'Kenya'},
          {"code": 'KG', "name": 'Kyrgyzstan'},
          {"code": 'KH', "name": 'Cambodia'},
          {"code": 'KI', "name": 'Kiribati'},
          {"code": 'KM', "name": 'Comoros'},
          {"code": 'KN', "name": 'Saint Kitts And Nevis'},
          {"code": 'KP', "name": 'Korea, Democratic People\'s Republic Of'},
          {"code": 'KR', "name": 'Korea, Republic Of'},
          {"code": 'KW', "name": 'Kuwait'},
          {"code": 'KY', "name": 'Cayman Islands'},
          {"code": 'KZ', "name": 'Kazakhstan'},
          {"code": 'LA', "name": 'Lao People\'s Democratic Republic'},
          {"code": 'LB', "name": 'Lebanon'},
          {"code": 'LC', "name": 'Saint Lucia'},
          {"code": 'LI', "name": 'Liechtenstein'},
          {"code": 'LK', "name": 'Sri Lanka'},
          {"code": 'LR', "name": 'Liberia'},
          {"code": 'LS', "name": 'Lesotho'},
          {"code": 'LT', "name": 'Lithuania'},
          {"code": 'LU', "name": 'Luxembourg'},
          {"code": 'LV', "name": 'Latvia'},
          {"code": 'LY', "name": 'Libya'},
          {"code": 'MA', "name": 'Morocco'},
          {"code": 'MC', "name": 'Monaco'},
          {"code": 'MD', "name": 'Moldova, Republic Of'},
          {"code": 'ME', "name": 'Montenegro'},
          {"code": 'MF', "name": 'Saint Martin (French Part)'},
          {"code": 'MG', "name": 'Madagascar'},
          {"code": 'MH', "name": 'Marshall Islands'},
          {"code": 'MK', "name": 'Macedonia, The Former Yugoslav Republic Of'},
          {"code": 'ML', "name": 'Mali'},
          {"code": 'MM', "name": 'Myanmar'},
          {"code": 'MN', "name": 'Mongolia'},
          {"code": 'MO', "name": 'Macao'},
          {"code": 'MP', "name": 'Northern Mariana Islands'},
          {"code": 'MQ', "name": 'Martinique'},
          {"code": 'MR', "name": 'Mauritania'},
          {"code": 'MS', "name": 'Montserrat'},
          {"code": 'MT', "name": 'Malta'},
          {"code": 'MU', "name": 'Mauritius'},
          {"code": 'MV', "name": 'Maldives'},
          {"code": 'MW', "name": 'Malawi'},
          {"code": 'MX', "name": 'Mexico'},
          {"code": 'MY', "name": 'Malaysia'},
          {"code": 'MZ', "name": 'Mozambique'},
          {"code": 'NA', "name": 'Namibia'},
          {"code": 'NC', "name": 'New Caledonia'},
          {"code": 'NE', "name": 'Niger'},
          {"code": 'NF', "name": 'Norfolk Island'},
          {"code": 'NG', "name": 'Nigeria'},
          {"code": 'NI', "name": 'Nicaragua'},
          {"code": 'NL', "name": 'Netherlands'},
          {"code": 'NO', "name": 'Norway'},
          {"code": 'NP', "name": 'Nepal'},
          {"code": 'NR', "name": 'Nauru'},
          {"code": 'NU', "name": 'Niue'},
          {"code": 'NZ', "name": 'New Zealand'},
          {"code": 'OM', "name": 'Oman'},
          {"code": 'PA', "name": 'Panama'},
          {"code": 'PE', "name": 'Peru'},
          {"code": 'PF', "name": 'French Polynesia'},
          {"code": 'PG', "name": 'Papua New Guinea'},
          {"code": 'PH', "name": 'Philippines'},
          {"code": 'PK', "name": 'Pakistan'},
          {"code": 'PL', "name": 'Poland'},
          {"code": 'PM', "name": 'Saint Pierre And Miquelon'},
          {"code": 'PN', "name": 'Pitcairn'},
          {"code": 'PR', "name": 'Puerto Rico'},
          {"code": 'PS', "name": 'Palestine, State Of'},
          {"code": 'PT', "name": 'Portugal'},
          {"code": 'PW', "name": 'Palau'},
          {"code": 'PY', "name": 'Paraguay'},
          {"code": 'QA', "name": 'Qatar'},
          {"code": 'RE', "name": 'Réunion'},
          {"code": 'RO', "name": 'Romania'},
          {"code": 'RS', "name": 'Serbia'},
          {"code": 'RU', "name": 'Russian Federation'},
          {"code": 'RW', "name": 'Rwanda'},
          {"code": 'SA', "name": 'Saudi Arabia'},
          {"code": 'SB', "name": 'Solomon Islands'},
          {"code": 'SC', "name": 'Seychelles'},
          {"code": 'SD', "name": 'Sudan'},
          {"code": 'SE', "name": 'Sweden'},
          {"code": 'SG', "name": 'Singapore'},
          {"code": 'SH', "name": 'Saint Helena, Ascension And Tristan Da Cunha'},
          {"code": 'SI', "name": 'Slovenia'},
          {"code": 'SJ', "name": 'Svalbard And Jan Mayen'},
          {"code": 'SK', "name": 'Slovakia'},
          {"code": 'SL', "name": 'Sierra Leone'},
          {"code": 'SM', "name": 'San Marino'},
          {"code": 'SN', "name": 'Senegal'},
          {"code": 'SO', "name": 'Somalia'},
          {"code": 'SR', "name": 'Suriname'},
          {"code": 'SS', "name": 'South Sudan'},
          {"code": 'ST', "name": 'Sao Tome And Principe'},
          {"code": 'SV', "name": 'El Salvador'},
          {"code": 'SX', "name": 'Sint Maarten (Dutch Part)'},
          {"code": 'SY', "name": 'Syrian Arab Republic'},
          {"code": 'SZ', "name": 'Swaziland'},
          {"code": 'TC', "name": 'Turks And Caicos Islands'},
          {"code": 'TD', "name": 'Chad'},
          {"code": 'TF', "name": 'French Southern Territories'},
          {"code": 'TG', "name": 'Togo'},
          {"code": 'TH', "name": 'Thailand'},
          {"code": 'TJ', "name": 'Tajikistan'},
          {"code": 'TK', "name": 'Tokelau'},
          {"code": 'TL', "name": 'Timor-Leste'},
          {"code": 'TM', "name": 'Turkmenistan'},
          {"code": 'TN', "name": 'Tunisia'},
          {"code": 'TO', "name": 'Tonga'},
          {"code": 'TR', "name": 'Turkey'},
          {"code": 'TT', "name": 'Trinidad And Tobago'},
          {"code": 'TV', "name": 'Tuvalu'},
          {"code": 'TW', "name": 'Taiwan'},
          {"code": 'TZ', "name": 'Tanzania, United Republic Of'},
          {"code": 'UA', "name": 'Ukraine'},
          {"code": 'UG', "name": 'Uganda'},
          {"code": 'UM', "name": 'United States Minor Outlying Islands'},
          {"code": 'US', "name": 'United States'},
          {"code": 'UY', "name": 'Uruguay'},
          {"code": 'UZ', "name": 'Uzbekistan'},
          {"code": 'VA', "name": 'Holy See (Vatican City State)'},
          {"code": 'VC', "name": 'Saint Vincent And The Grenadines'},
          {"code": 'VE', "name": 'Venezuela, Bolivarian Republic Of'},
          {"code": 'VG', "name": 'Virgin Islands, British'},
          {"code": 'VI', "name": 'Virgin Islands, U.S.'},
          {"code": 'VN', "name": 'Viet Nam'},
          {"code": 'VU', "name": 'Vanuatu'},
          {"code": 'WF', "name": 'Wallis And Futuna'},
          {"code": 'WS', "name": 'Samoa'},
          {"code": 'YE', "name": 'Yemen'},
          {"code": 'YT', "name": 'Mayotte'},
          {"code": 'ZA', "name": 'South Africa'},
          {"code": 'ZM', "name": 'Zambia'},
          {"code": 'ZW', "name": 'Zimbabwe'}
        ];
        return countries;
      },*/
      year_list: function(){
        var years = [];
        var year = new Date().getFullYear();
        for(var i=year;i>=1900;i--){
          years.push(i);
        }
        return years;
      }
    };

  }]);
