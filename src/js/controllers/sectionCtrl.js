app.controller('sectionCtrl', ['$scope', '$rootScope', '$stateParams', '$filter', '$uibModal', 'Data',
  function($scope, $rootScope, $stateParams ,$filter, $uibModal, Data){
  $scope.id_exam = $stateParams.id;

  $rootScope.exam_id_in_page = $stateParams.id;
  $scope.section = {};

  Data.get('examies/'+$stateParams.id+'/sections').then(function(data){
    $scope.sections = data;
    Data.get('examies/'+$scope.id_exam).then(function(data){
      $scope.exam = data;
    });
  });

  $scope.showAllQuestion = function(p, q, size){
    $rootScope.id_section = q.id;
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/section_questions/questions.html',
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
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/section_questions/question_random.html',
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
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/sections/sectionNew.html',
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

  $scope.edit = function (p,size) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/sections/edit.html',
      controller: 'sectionEditCtrl',
      size: size,
      resolve: {
        item: function () {
          return p;
        }
      }
    });
    modalInstance.result.then(function(selectedObject) {
      p.name = selectedObject.name;
      p.time_limit = selectedObject.time_limit;
    });
  };

  $scope.deleteSection = function(section){
    if(confirm("Bạn có chắc chắn muốn xóa section")){
      Data.delete('examies/'+$stateParams.id+'/sections/'+section.id).then(function(result){
        $scope.sections = _.without($scope.sections, _.findWhere($scope.sections, {id:section.id}));
      });
      Data.get('sections/'+ section.id ).then(function(data){
        var section_questions = data;
        for(var j = 0; j < section_questions.length; j++){
          Data.delete('section_questions/'+section_questions[j].id).then(function(result){});
        }
      });
    }
  };

  $scope.columns = [
    {text:"ID",predicate:"id", sortable: true},
    {text:"Number Question",predicate:"numberQuestion"},
    {text:"Time Limit",predicate:"time_limit",sortable:false}
  ];
}]);

app.controller('sectionEditCtrl', ['$scope', '$rootScope', '$uibModalInstance', 'item', 'Data',
  function ($scope, $rootScope, $uibModalInstance, item, Data){
  $scope.section = angular.copy(item);
  $scope.cancel = function() {
    $uibModalInstance.dismiss('Close');
  }

  $scope.title = 'Chỉnh sửa section';
  $scope.buttonText = 'Cập nhật';
  var original = item;
  $scope.isClean = function(){
    return angular.equals(original, $scope.section);
  }

  $scope.saveSection = function(section) {
    Data.put('examies/'+ $rootScope.exam_id_in_page+'/sections/'+section.id, $scope.section).then(function (result){
      if (result.status != 'error'){
        var x = angular.copy(section);
        x.save = 'update';
        $uibModalInstance.close(x);
      }else{
        console.log(result);
      }
    });
  }
}]);

app.controller('sectionNewCtrl', ['$scope', '$stateParams', '$uibModalInstance', '$http', 'Data',
  function($scope, $stateParams, $uibModalInstance, $http, Data){
  $scope.cancel = function() {
    $uibModalInstance.dismiss('Close');
  }
  $scope.title = 'Tạo mới section';
  $scope.buttonText = 'Thêm';
  $scope.addSection = function(section) {
    section.exam_id = $stateParams.id;
    Data.post('examies/'+$stateParams.id+'/sections', section).then(function (result) {
      if(result.status != 'error'){
          var x = angular.copy(section);
          x.save = 'insert';
          x.id = result.data;
          $uibModalInstance.close(x);
      }else{
        console.log(result);
      }
    });
  }
}]);