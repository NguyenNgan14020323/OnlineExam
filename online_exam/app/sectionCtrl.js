app.controller('sectionCtrl', function($scope, $rootScope, $routeParams ,$filter, $modal, Data){
  $scope.id_exam = $routeParams.id;
  $scope.section = {};

  Data.get('examies/'+$routeParams.id+'/sections').then(function(data){
    $scope.sections = data;
  });

  $scope.showAllQuestion = function(p, q, size){
    $rootScope.id_section = q.id;
    var modalInstance = $modal.open({
      templateUrl: 'html/section_questions/questions.html',
      controller: 'section_questionCtrl',
      size: size,
      resolve: {
        item: function(){
          return p;
        }
      }
    });
  };

  $scope.addRandomQuestion = function(p, q, size){
    $rootScope.id_section = q.id;
    var modalInstance = $modal.open({
      templateUrl: 'html/section_questions/question_random.html',
      controller: 'section_questionCtrl',
      size: size,
      resolve: {
        item: function(){
          return p;
        }
      }
    });
  };

  $scope.open = function(p, size){
    var modalInstance = $modal.open({
      templateUrl: 'html/sections/sectionNew.html',
      controller: 'sectionNewCtrl',
      size: size,
      resolve: {
        item: function() {
          return p;
        }
      }
    });
    modalInstance.result.then(function(selectedObject){
      $scope.sections.push(selectedObject);
      $scope.sections = $filter('orderBy')($scope.sections, '-id', 'reverse');
    });
  };

  $scope.deleteSection = function(section){
    if(confirm("Are you sure to remove the section")){
      Data.delete('examies/'+$routeParams.id+'/sections/'+section.id).then(function(result){
        $scope.sections = _.without($scope.sections, _.findWhere($scope.sections, {id:section.id}));
      });
    }
  };

  $scope.columns = [
    {text:"ID",predicate:"id", sortable: true},
    {text:"Number Question",predicate:"numberQuestion"},
    {text:"Time Limit",predicate:"time_limit",sortable:false}
  ];
});

app.controller('sectionNewCtrl', function($scope, $routeParams, $modalInstance, $http, Data){
  $scope.cancel = function() {
    $modalInstance.dismiss('Close');
  }
  $scope.title = 'New Section';
  $scope.buttonText = 'Add';
  $scope.addSection = function(section) {
    section.exam_id = $routeParams.id;
    Data.post('examies/'+$routeParams.id+'/sections', section).then(function (result) {
      if(result.status != 'error'){
          var x = angular.copy(section);
          x.save = 'insert';
          x.id = result.data;
          $modalInstance.close(x);
      }else{
        console.log(result);
      }
    });
  }
});
