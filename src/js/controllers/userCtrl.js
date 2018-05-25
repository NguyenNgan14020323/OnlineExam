app.controller('signupCtrl',[ '$scope', '$filter', 'Data' ,'md5','$window',function ($scope, $filter, Data,md5,$window){

	 $scope.signup = function (){
	 user = $scope.user;
	 user.password = md5.createHash(user.password);
	 	console.log($scope.user);
	 	Data.post('signup', user).then(function (result) {
                console.log(result);
                if (result.serverStatus != '2') {
                    var x = angular.copy($scope.question);
                    x.save = 'update';
                } else {
                  var host = $window.location.host;
                  var landingUrl = "http://" + host + "/#";
                  $window.location.href = landingUrl;
                }
            });
	 }

}])

app.controller('loginCtrl',[ '$scope', '$filter', 'Data' ,'md5','$window','$rootScope','$cookieStore','$route',
  function ($scope, $filter, Data,md5,$window,$upload, cloudinary,$rootScope,$cookieStore,$route){
	 $scope.login = function (){
      user = $scope.user;
      // console.log(user);
      user.password = md5.createHash(user.password);
      Data.get('getByEmail/'+ user.email ).then(function(result){
        if(result.status != 'error'){
          if(user.password == result[0].password){
            sessionStorage.id = result[0].id;
            var host = $window.location.host;
                  var landingUrl = "http://" + host + "/#";
                  $window.location.href = landingUrl;
                   window.location.reload(); 
          } else{
            if(confirm("Mật khẩu hoặc email không chính xác!!!!")){
                var host = $window.location.host;
                  var landingUrl = "http://" + host + "/#/login";
                  $window.location.href = landingUrl;
                   window.location.reload();
            }
          }
          // $location.path('/');
        }else{
          if(confirm("Mật khẩu hoặc email không chính xác!!!!")){
                var host = $window.location.host;
                  var landingUrl = "http://" + host + "/#/login";
                  $window.location.href = landingUrl;
                   window.location.reload();
            }
        }
      });
	 }

}])

app.controller('profileCtrl',['$scope', '$rootScope', '$routeParams', '$location', 'Upload', 'cloudinary', '$filter', 'Data','$window',
  function ($scope, $rootScope, $routeParams, $location, $upload, cloudinary, $filter, Data,$window){
      Data.get('getById/'+ sessionStorage.id).then(function(result){
        if(result.status != 'error'){
          $scope.user = result[0];
        }else{
          console.log(result);
        }
      });

var url = null;
    $rootScope.url = "";
    var d = new Date();
    $scope.title = "Image (" + d.getDate() + " - " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ")";
    $scope.uploadFiles = function(files){
      $scope.files = files;
      if (!$scope.files) return;
      angular.forEach(files, function(file){
        if (file && !file.$error) {
          file.upload = $upload.upload({
            url: "https://api.cloudinary.com/v1_1/" + cloudinary.config().cloud_name + "/upload",
            data: {
              upload_preset: cloudinary.config().upload_preset,
              tags: 'myphotoalbum',
              context: 'photo=' + $scope.title,
              file: file
            }
          }).progress(function (e) {
            file.progress = Math.round((e.loaded * 100.0) / e.total);
            file.status = "Uploading... " + file.progress + "%";
          }).success(function (data, status, headers, config) {
            console.log(data.url);
            $rootScope.url = data.url;
            $rootScope.photos = $rootScope.photos || [];
            data.context = {custom: {photo: $scope.title}};
            file.result = data;
            $rootScope.photos.push(data);
            $scope.user.avartar = $rootScope.url;
          }).error(function (data, status, headers, config) {
            file.result = data;
          });
        }
      });
    };
    //});

    /* Modify the look and fill of the dropzone when files are being dragged over it */
    $scope.dragOverClass = function($event) {
      var items = $event.dataTransfer.items;
      var hasFile = false;
      if (items != null) {
        for (var i = 0 ; i < items.length; i++) {
          if (items[i].kind == 'file') {
            hasFile = true;
            break;
          }
        }
      } else {
        hasFile = true;
      }
      return hasFile ? "dragover" : "dragover-err";
    };

      $scope.update = function (){
          console.log($scope.user);
          Data.put('updateUser', $scope.user).then(function (result) {
                console.log(result);
                if (result.serverStatus != '2') {
                    x.save = 'update';
                } else {
                  var host = $window.location.host;
                  var landingUrl = "http://" + host + "/#/profile";
                  console.log(landingUrl);
                  $window.location.href = landingUrl;
                    console.log(result);
                }
            });

      }
   }

])


app.controller('changePassCtrl',[ '$scope', '$filter', 'Data' ,'md5','$window','$rootScope','$cookieStore','$route',
  function ($scope, $filter, Data,md5,$window,$upload, cloudinary,$rootScope,$cookieStore,$route){
    $scope.changePass = function (){
    Data.get('getById/'+ sessionStorage.id).then(function(result){
      old_password = md5.createHash($scope.old_password);
        if(result.status != 'error'){
          user = result[0];
          if(user.password == old_password){
            new_password = md5.createHash($scope.new_password);
              user.password = new_password;
              Data.put('updateUser', user).then(function (result) {
                console.log(result);
                if (result.serverStatus != '2') {
                    x.save = 'update';
                } else {
                  var host = $window.location.host;
                  var landingUrl = "http://" + host + "/#/home";
                  console.log(landingUrl);
                  $window.location.href = landingUrl;
                    console.log(result);
                }
            });
          } else{

            if(confirm("Mật khẩu không chính xác!!!!")){
            var host = $window.location.host;
                  var landingUrl = "http://" + host + "/#/changePass";
                  console.log(landingUrl);
                  $window.location.href = landingUrl;
                    console.log(result);
            }
          }
        }else{
          console.log(result);
        }
      });
  }
}])