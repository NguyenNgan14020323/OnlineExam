app.controller('examCtrl', ['$scope', '$filter', '$uibModal', '$cookieStore', 'Data',
  function($scope, $filter, $uibModal, $cookieStore, Data){

  Data.get('getById/'+ sessionStorage.id ).then(function(result){
    $scope.currentUser = result[0];
  });

  Data.get('examies').then(function(data){
    var list_exam = []
    for (var i = 0; i <data.length; i++){
      if (data[i].user_id == $scope.currentUser.id){
        list_exam.push(data[i]);
      }
    }
    $scope.examies = list_exam;
    $scope.viewby = 5;
    $scope.totalItems = $scope.examies.length;
    $scope.currentPage = 1;
    $scope.itemsPerPage = $scope.viewby;
    $scope.maxSize = 5;

    $scope.setPage = function(pageNo){
      $scope.currentPage = pageNo;
    }

    $scope.pageChanged = function() {
      console.log('Page changed to: ' + $scope.currentPage);
    }

    $scope.setItemsPerPage = function(num){
      $scope.itemsPerPage = num;
      $scope.currentPage = 1;
    }
  });


  $scope.open = function(p, size){
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/examies/examNew.html',
      controller: 'examNewCtrl',
      size: size,
      resolve: {
        item: function() {
          return p;
        }
      }
    });
    modalInstance.result.then(function(selectedObject){
      $scope.examies.push(selectedObject);
      $scope.examies = $filter('orderBy')($scope.examies, 'id', 'reverse');
    });
  };

  $scope.edit = function (p,size) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/examies/edit.html',
      controller: 'examEditCtrl',
      size: size,
      resolve: {
        item: function () {
          return p;
        }
      }
    });
    modalInstance.result.then(function(selectedObject) {
      p.name = selectedObject.name;
      p.open_time = selectedObject.open_time;
      p.close_time = selectedObject.close_time;
    });
  };

  $scope.deleteExam = function(exam){
    if(confirm("Bạn có chắc chắn muốn xóa cuộc thi không?")){
      Data.delete('examies/'+exam.id).then(function(result){
        $scope.examies = _.without($scope.examies, _.findWhere($scope.examies, {id:exam.id}));
      });
    }
    Data.get('examies/'+exam.id+'/sections').then(function(data){
      var sections = data;
      for(var i = 0; i < sections.length; i++){
        Data.get('sections/'+ sections[i].id ).then(function(data){
          var section_questions = data;
          for(var j = 0; j < section_questions.length; j++){
            Data.delete('section_questions/'+section_questions[j].id).then(function(result){});
          }
        });
      }
      for(var z = 0; z <sections.length; z++){
        Data.delete('examies/'+exam.id+'/sections/'+sections[z].id).then(function(result){});
      }
    });
  };

  $scope.columns = [
      {text:"Tên",predicate:"name",sortable:true},
      {text:"Thời gian bắt đầu",predicate:"open_time",sortable:true},
      {text:"Thời gian kết thúc",predicate:"close_time",sortable:false},
      {text:"Hành động"}
    ];
}]);

app.controller('examNewCtrl', ['$scope', '$uibModalInstance', '$cookieStore', '$rootScope', '$http', 'Data',
  function($scope, $uibModalInstance, $cookieStore, $rootScope, $http, Data){
  $scope.cancel = function() {
    $uibModalInstance.dismiss('Close');
  }

  Data.get('getById/'+ sessionStorage.id ).then(function(result){
    $scope.currentUser = result[0];
  });

  $scope.title = 'Tạo mới cuộc thi';
  $scope.buttonText = 'Thêm cuộc thi';
  $scope.addExam = function(exam) {
    exam.user_id = $scope.currentUser.id;
    Data.post('examies', exam).then(function (result) {
      if(result.status != 'error'){
        var x = angular.copy(exam);
        x.save = 'insert';
        x.id = result.data;
        $uibModalInstance.close(x);
      }else{
        console.log(result);
      }
    });
  }
}]);

app.controller('examEditCtrl', ['$scope', '$uibModalInstance', 'item', 'Data',
  function ($scope, $uibModalInstance, item, Data){
  item.open_time = new Date(item.open_time);
  item.close_time = new Date(item.close_time);
  $scope.exam = angular.copy(item);
  $scope.cancel = function() {
    $uibModalInstance.dismiss('Close');
  }

  $scope.title = 'Chỉnh sửa cuộc thi';
  $scope.buttonText = 'Cập nhật';
  var original = item;
  $scope.isClean = function(){
    return angular.equals(original, $scope.exam);
  }

  $scope.check_time_end = function(){
    console.log($scope.exam.open_time);
    console.log($scope.exam.close_time);
  }

  $scope.saveExam = function(exam) {
    Data.put('examies/'+exam.id, $scope.exam).then(function (result){
      if (result.status != 'error'){
        var x = angular.copy(exam);
        x.save = 'update';
        $uibModalInstance.close(x);
      }else{
        console.log(result);
      }
    });
  }
}]);

app.controller('detailExamCtrl', ['$scope', '$http', '$stateParams', '$routeParams', 'Data',
  function($scope, $stateParams, $routeParams, $http, Data){
  $scope.id_exam = $routeParams.id;

  Data.get('examies/'+$routeParams.id).then(function(data){
    $scope.examies = data;
  });

  Data.get('section_questions').then(function(data){
    $scope.section_questions = data;
  });

  Data.get('examies/'+$routeParams.id+'/sections').then(function(data){
     $scope.total_mark = 0;
      for(var i = 0; i < data.length; i++){
         Data.get('section_questions/' + data[i].id).then(function(result){
            for(var j = 0; j < result.length; j++){
               $scope.total_mark += result[j].mark;
            }
         })
      }
    angular.forEach(data, function(value, key) {
      Data.get('examies/'+ value.id +'/question').then(function(data){
        value.question = data;
      });
    })
    $scope.sections = data;
  });

   $scope.check = false;
   $scope.change = function(){
     $scope.check = true;
   };



  $scope.getdetails = function(section, question){
    var section_question_id;
    angular.forEach($scope.section_questions, function(value, key) {
      if (value.section_id == section.id && value.question_id == question.id){
        section_question_id = value.id;
      }
    });
    var section_question = {
        id: section_question_id,
        mark: question.mark,
        question_id: question.id,
        section_id: section.id
    };
    Data.put('section_questions/'+section_question_id, section_question).then(function (result){
      if (result.status != 'error'){
        var x = angular.copy(section_question);
      }else{
        console.log(result);
      }
    });
  };

  $scope.deleteSectionQuestion = function(question_id, section_id){
    var section_question_id;
    angular.forEach($scope.section_questions, function(value, key) {
      if (value.section_id == section_id && value.question_id == question_id){
        section_question_id = value.id;
      }
    });
    if(confirm("Are you sure!!!!")){
      Data.delete('section_questions/'+section_question_id).then(function(result){
        $scope.section_questions = _.without($scope.section_questions, _.findWhere($scope.section_questions, {id:section_question_id}));
      });
    }
  };
}]);

app.controller('examTestCtrl', ['$scope', '$http', '$stateParams','$interval', '$routeParams', 'Data',
  function($scope, $stateParams, $routeParams, $http, $interval, Data){ 
  $scope.id_exam = $routeParams.id;
  $scope.exam_student = {};
  $scope.exam_student.sheet = [];
  Data.get('examies/'+$routeParams.id).then(function(data){
    $scope.examies = data;
  });

   document.getElementById("sidebar-wrapper").style.display="none";
   document.getElementById("content-header").style.display = "none";
   document.getElementById("main_content").style.marginLeft = "-22%";

  Data.get('section_questions').then(function(data){
    $scope.section_questions = data;
  });
  $scope.totalQuestion = 0;
  $scope.totalScore = 0;

  Data.get('examies/'+$routeParams.id+'/sections').then(function(data){
     $scope.viewby = 1;
     $scope.totalItems = data.length;
     $scope.currentPage = 1;
     $scope.itemsPerPage = $scope.viewby;
     $scope.maxSize = 5;
  
      $scope.total_mark = 0;
      for(var i = 0; i < data.length; i++){
         Data.get('section_questions/' + data[i].id).then(function(result){
            for(var j = 0; j < result.length; j++){
               $scope.total_mark += result[j].mark;
            }
         })
      }
   angular.forEach(data, function(value, key) {
      Data.get('examies/'+ value.id +'/question').then(function(data){
        for(var i = 0; i < data.length; i++){
          var choice = {"question_id":data[i].id};
          $scope.exam_student.sheet.push(choice);
          var str = data[i].answers
          data[i].answers = {}
          data[i].answers = JSON.parse(str);
          if(data[i].type == "MulQuestion"){
            $scope.totalQuestion += data[i].answers.length - 1;
          }
        }
        value.question = data;
        $scope.totalQuestion += data.length;
      });
    })
   $scope.sections = data;
   $scope.minute = 0;
   for(var i = 0; i < $scope.sections.length; i++){
      $scope.minute += $scope.sections[i].time_limit;
   }
  });
   $scope.second = 0;
   $stop = $http(function() {
     if($scope.minute > 0 && $scope.second == 0){
        $scope.minute --;
        $scope.second = 60;
     }
     if($scope.minute == 0 && $scope.second == 0){
      $scope.minute = 0;
      $scope.second = 0;
      $scope.getScore();
      $http.cancel($stop)
     }  
      $scope.second--;     
   }, 1000);

   $scope.check = false;
 
   $scope.change = function(){
     $scope.check = true;
   };
   $scope.score = 0;
   $scope.count = 0
   $scope.id = 0;
   $scope.checkAnswer = function(value){
      // if(value == 100){
      //    $scope.count ++;    
      //    $scope.score += value;
      // }
      console.log(typeof value);
      document.getElementById("Question1A").style.backgroundColor = "#5cb85c";
   }

   $scope.checkAnswerFillWord = function(){

   }
   $scope.showScore = false;
   $scope.getScore = function(){
   var total = document.getElementById("totalQuestion").value;
     // for(var i = 1; i <= total; i++){
     //    console.log(document.getElementById("Question"+i).value);
     // }
      $scope.showScore = !$scope.showScore;
      $scope.totalScore = $scope.totalQuestion * 100;
      $scope.score = ($scope.score / $scope.totalQuestion) / 10;
   }
   // $scope.total_mark = function(exam){
   // }
   $scope.getdetails = function(section, question){
    var section_question_id;

    angular.forEach($scope.section_questions, function(value, key) {
      if (value.section_id == section.id && value.question_id == question.id){
        section_question_id = value.id;
      }
    });
    var section_question = {
        id: section_question_id,
        mark: question.mark,
        question_id: question.id,
        section_id: section.id
    };
    Data.put('section_questions/'+section_question_id, section_question).then(function (result){
      if (result.status != 'error'){
        var x = angular.copy(section_question);
      }else{
        console.log(result);
      }
    });
  };

  $scope.deleteSectionQuestion = function(question_id, section_id){
    var section_question_id;
    angular.forEach($scope.section_questions, function(value, key) {
      if (value.section_id == section_id && value.question_id == question_id){
        section_question_id = value.id;
      }
    });
    if(confirm("Are you sure!!!!")){
      Data.delete('section_questions/'+section_question_id).then(function(result){
        $scope.section_questions = _.without($scope.section_questions, _.findWhere($scope.section_questions, {id:section_question_id}));
      });
    }
  };
}]);



