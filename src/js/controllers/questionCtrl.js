app.controller('questionCtrl',[ '$scope', '$filter', 'Data' ,function ($scope, $filter, Data){
    Data.get('questions').then(function(data){
      $scope.questions = data;
      $scope.viewby = 5;
      $scope.totalItems = $scope.questions.length;
      $scope.currentPage = 1;
      $scope.itemsPerPage = $scope.viewby;
      $scope.maxSize = 5;

      $scope.setPage = function(pageNo){
        $scope.currentPage = pageNo;
      }

      $scope.pageChanged = function() {
     //   console.log('Page changed to: ' + $scope.currentPage);
      }

      $scope.setItemsPerPage = function(num){
        $scope.itemsPerPage = num;
        $scope.currentPage = 1;
      }
    });

    $scope.columns = [
      {text:"#",predicate:"STT",sortable:true},
      {text:"Content",predicate:"content", sortable:true},
      {text:"Category",predicate:"category",sortable:false},
      {text:"Action", sortable: false},
    ];

     $scope.deleteQuestions = function (question) {
      if(confirm("Are you sure!!!!")){
        Data.delete('question/'+question.id).then(function(result){
           $scope.questions = _.without($scope.questions, _.findWhere($scope.questions, {id:question.id}));
        });
      }
    };
}])

app.controller('addQuestionCtrl', ['$scope', '$rootScope', '$routeParams', '$location', 'Upload', 'cloudinary', '$filter', 'Data','$window',
  function ($scope, $rootScope, $routeParams, $location, $upload, cloudinary, $filter, Data,$window){
    
   Data.get('categories').then(function (data) {
        $scope.categories = data;
    });
  
    $scope.question = {}; 

    $scope.FillWord = function(){
      $scope.question.answers = {};
    }
    $scope.TrueFalse = function(){
       $scope.question.answers = {};
    }
    $scope.MulChoose = function(){
       $scope.question.answers = [];
      var choice1 = {"id" : 1,"grade":100};
      var choice2 = {"id" : 2,"grade":0};
      var choice3 = {"id" : 3,"grade":0};
      var choice4 = {"id" : 4,"grade":0};
      $scope.question.answers.push(choice1);
      $scope.question.answers.push(choice2);
      $scope.question.answers.push(choice3);
      $scope.question.answers.push(choice4);
    } 

    var index = 1;
    $scope.question.answers = [];
    var question1 = {"id" : index};
    question1.answers = [];
    $scope.FillWord1 = function(){
      question1.answers = {};
    }
    $scope.TrueFalse1 = function(){
      question1.answers = {};
    }
    $scope.MulChoose1 = function(){
      question1.answers = [];
    } 

    $scope.MulQuestion = function(){   
        var question1 = {"id" : index};
        question1.answers = [];
        var choice1 = {"id" : 1, "grade":100};
        var choice2 = {"id" : 2, "grade":0};
        var choice3 = {"id" : 3, "grade":0};
        var choice4 = {"id" : 4, "grade":0};
        question1.answers.push(choice1);
        question1.answers.push(choice2);
        question1.answers.push(choice3);
        question1.answers.push(choice4);
        $scope.question.answers.push(question1);
        index++;
    };

    $scope.addQuestion = function(){
        var question1 = {"id" : index};
        question1.answers = [];
        var choice1 = {"id" : 1, "grade":100};
        var choice2 = {"id" : 2, "grade":0};
        var choice3 = {"id" : 3, "grade":0};
        var choice4 = {"id" : 4, "grade":0};
         question1.answers.push(choice1);
         question1.answers.push(choice2);
         question1.answers.push(choice3);
        question1.answers.push(choice4);
        $scope.question.answers.push(question1);
        index++;
    }

    $scope.processData = function(data) {
      for ( var i = 1; i < data.length; i++) {
        $scope.question = {};
        $scope.question.title = data[i][0];
        $scope.question.content = data[i][1];
        $scope.question.category_id = data[i][2];
        $scope.question.type = "MulChoose";
        $scope.question.file ="";
        $scope.question.answers = [];
        var choice1 = {"id" : 1, "content": data[i][3], "grade": parseInt(data[i][4])};
        var choice2 = {"id" : 2, "content": data[i][5], "grade": parseInt(data[i][6])};
        var choice3 = {"id" : 3, "content": data[i][7], "grade": parseInt(data[i][8])};
        var choice4 = {"id" : 4, "content": data[i][9], "grade": parseInt(data[i][10])};
        $scope.question.answers.push(choice1);
        $scope.question.answers.push(choice2);
        $scope.question.answers.push(choice3);
        $scope.question.answers.push(choice4);   
        Data.post('addQuestions', $scope.question).then(function (result) {
        if (result.serverStatus != '2') {
            var x = angular.copy($scope.question);
            x.save = 'update';
        }else{
            var host = $window.location.host;
                  var landingUrl = "http://" + host + "/#/questions";
              
                  $window.location.href = landingUrl;
                 
        }
      });       
    }
    var host = $window.location.host;
    var landingUrl = "http://" + host + "/#/home";
    $window.location.href = landingUrl;
    };

    var url = null;
    $rootScope.url = "";
       $rootScope.filetype ="";
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
            $rootScope.url = data.url;
            $rootScope.filetype = data.resource_type;
            $rootScope.photos = $rootScope.photos || [];
            data.context = {custom: {photo: $scope.title}};
            file.result = data;
            $rootScope.photos.push(data);
            $scope.question.filetype =   $rootScope.filetype;
            $scope.question.file = $rootScope.url;
          }).error(function (data, status, headers, config) {
            file.result = data;
           
          });
        }
      });
    };
    //});
    //Xóa câu hỏi trong mul question
    $scope.deleteQuestion = function (q) {
      if(confirm("Are you sure!!!!")){
           $scope.question.answers = _.without($scope.question.answers, _.findWhere($scope.question.answers, {id:q.id}));
        
      }
    };
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
    $scope.saveQuestion = function () {
      $scope.question.file = $rootScope.url;
            Data.post('addQuestions', $scope.question).then(function (result) {
                if (result.serverStatus != '2') {
                    var x = angular.copy($scope.question);
                    x.save = 'update';
                } else {
                  var host = $window.location.host;
                  var landingUrl = "http://" + host + "/#/questions";
              
                  $window.location.href = landingUrl;
                 
                }
            });
    };
}])

app.controller('editQuestionCtrl', ['$scope', '$rootScope', '$stateParams', '$location', 'Upload', 'cloudinary', '$filter', 'Data','$window',
  function ($scope, $rootScope, $stateParams, $location, $upload, cloudinary, $filter, Data,$window){
    $scope.id = $stateParams.id;
    Data.get('categories').then(function (data) {
        $scope.categories = data;
    });
    Data.get('questions/edit/'+$stateParams.id).then(function(data){
      $scope.question = data[0];
      $scope.question.answers = JSON.parse($scope.question.answers);
      $rootScope.photos =  $scope.question.file;
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
            $rootScope.url = data.url;
            $rootScope.photos = $rootScope.photos || [];
            data.context = {custom: {photo: $scope.title}};
            file.result = data;
            // $rootScope.photos.push(data);
            $scope.question.file = $rootScope.url;
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

    $scope.saveQuestion = function () {
      Data.put('editQuestions', $scope.question).then(function (result) {
                if (result.serverStatus != '2') {
                    x.save = 'update';
                } else {
                  var host = $window.location.host;
                  var landingUrl = "http://" + host + "/#/questions";

                  $window.location.href = landingUrl;

                }
            });

    };

}]);
