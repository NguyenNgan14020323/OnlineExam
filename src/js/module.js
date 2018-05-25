var app = angular.module('RDash', ['ui.bootstrap', 'ui.router', 'ngCookies','ngAnimate','ngRoute','cloudinary',
  'ngResource','ngFileUpload','angular-md5',
  ]);



app.service('Data', ['$http', '$location',
    function ($http, $q, $location) {

        var serviceBase = 'http://localhost:3000/api/';

        var obj = {};

        obj.get = function (q) {
            return $http.get(serviceBase + q).then(function (results) {
                return results.data;
            });
        };
        obj.post = function (q, object) {
            return $http.post(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.put = function (q, object) {
            return $http.put(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.patch = function(q, object){
            return $http.put(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        }
        obj.delete = function (q) {
            return $http.delete(serviceBase + q).then(function (results) {
                return results.data;
            });
        };

        return obj;
}]);
app.factory('album', ['$rootScope', '$resource', 'cloudinary',
  function($rootScope, $resource, cloudinary){
    // instead of maintaining the list of images, we rely on the 'myphotoalbum' tag
    // and simply retrieve a list of all images with that tag.
    var url = cloudinary.url('myphotoalbum', {format: 'json', type: 'list'});
    //cache bust
    url = url + "?" + Math.ceil(new Date().getTime()/1000);
    return $resource(url, {}, {
      photos: {method:'GET', isArray:false}
    });
  }]);
app.animation('.photo', function() {

  var animateUp = function(element, className, done) {
    if(className != 'active') {
      return;
    }
    element.css({
      position: 'absolute',
      top: 500,
      left: 0,
      display: 'block'
    });

    jQuery(element).animate({
      top: 0
    }, done);

    return function(cancel) {
      if(cancel) {
        element.stop();
      }
    };
  };

  var animateDown = function(element, className, done) {
    if(className != 'active') {
      return;
    }
    element.css({
      position: 'absolute',
      left: 0,
      top: 0
    });

    jQuery(element).animate({
      top: -500
    }, done);

    return function(cancel) {
      if(cancel) {
        element.stop();
      }
    };
  };

  return {
    addClass: animateUp,
    removeClass: animateDown
  };
});

app.config(['cloudinaryProvider', function (cloudinaryProvider) {
  cloudinaryProvider
      .set("cloud_name", "dgeuxpcam")
      .set("upload_preset", "online_exam");
}]);

app.value('currentUser', {value: {}});

app.factory('Session', function($http) {
  var Session = {
    data: {},
    saveSession: function() { /* save session data to db */ },
    updateSession: function() {
      /* load data from db */
      $http.get('session.json').then(function(r) { return Session.data = r.data;});
    }
  };
  Session.updateSession();
  return Session;
});




