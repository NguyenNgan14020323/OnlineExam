app.controller('examCtrl', function($scope, $filter, $modal, Data){
  $scope.exam = {};
  Data.get('examies').then(function(data){
    $scope.examies = data;
  });
  $scope.open = function(p, size){
     //console.log("i stayed here...")
    var modalInstance = $modal.open({
      templateUrl: 'html/examies/examNew.html',
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

  $scope.deleteExam = function(exam){
    if(confirm("Are you sure!!!!")){
      Data.delete('examies/'+exam.id).then(function(result){
        $scope.examies = _.without($scope.examies, _.findWhere($scope.examies, {id:exam.id}));
      });
    }
  };

  $scope.columns = [
      {text:"Name",predicate:"name",sortable:true},
      {text:"Time Start",predicate:"open_time",sortable:true},
      {text:"Time Finish",predicate:"close_time",sortable:false},
      {text:"Action"}
    ];
});

app.controller('examNewCtrl', function($scope, $modalInstance, $http, Data,$window){
  $scope.cancel = function() {
    $modalInstance.dismiss('Close');
  }
  $scope.title = 'New Exam';
  $scope.buttonText = 'Add Exam';
  $scope.addExam = function(exam) {
    Data.post('examies', exam).then(function (result) {
      if(result.status != 'error'){
          var x = angular.copy(exam);
          x.save = 'insert';
          x.id = result.data;
          $modalInstance.close(x);
          var host = $window.location.host;
        var landingUrl = "http://" + host + "/#/examies";
        $window.location.href = landingUrl;
      }else{
        console.log(result);
      }
    });
  }
});
app.controller('detailExamCtrl', function($scope, $routeParams ,$http, Data){
  $scope.id_exam = $routeParams.id;

  Data.get('examies/'+$routeParams.id).then(function(data){
    $scope.examies = data;
  });

  Data.get('section_questions').then(function(data){
    $scope.section_questions = data;
  });

  Data.get('examies/'+$routeParams.id+'/sections').then(function(data){
    angular.forEach(data, function(value, key) {
      Data.get('examies/'+ value.id +'/question').then(function(data){
        value.question = data;
      });
    })
    $scope.sections = data;
  });

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
}); 
