app.controller('studentCtrl',['$scope', '$uibModal', '$filter', '$cookieStore', 'Data',
  function ($scope, $uibModal, $filter, $cookieStore, Data) {
  $scope.students = {};
  Data.get('getById/'+ sessionStorage.id ).then(function(result){
    $scope.currentUser = result[0];
  });
  Data.get('students/7').then(function(data){
    $scope.students = data;
    $scope.viewby = 5;
    $scope.totalItems = $scope.students.length;
    $scope.currentPage = 1;
    $scope.itemsPerPage = $scope.viewby;
    $scope.maxSize = 5;

    $scope.setPage = function(pageNo){
      $scope.currentPage = pageNo;
    }

    $scope.pageChanged = function() {
      // console.log('Page changed to: ' + $scope.currentPage);
    }

    $scope.setItemsPerPage = function(num){
      $scope.itemsPerPage = num;
      $scope.currentPage = 1;
    }
  });
   $scope.deleteStudent = function(students){
    if(confirm("Are you sure!!!!")){
      Data.delete('students/'+students.id).then(function(result){
        $scope.students = _.without($scope.students, _.findWhere($scope.students, {id:students.id}));
      });
    }
  };
   $scope.open = function(p, size){
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/students/studentNew.html',
      controller: 'studentNewCtrl',
      size: size,
      resolve: {
        item: function() {
          return p;
        }
      }
    });
    modalInstance.result.then(function(selectedObject){
      $scope.categories.push(selectedObject);
      $scope.categories = $filter('orderBy')($scope.categories, 'id', 'reverse');
    });
  };
  $scope.editStudent = function (p,size) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/students/studentEdit.html',
      controller: 'studentEditCtrl',
      size: size,
      resolve: {
        item: function () {
          return p;
        }
      }
    });
    modalInstance.result.then(function(selectedObject) {
      p.name = selectedObject.name;
      p.descriptions = selectedObject.descriptions;
    });
  };

  $scope.columns = [
      {text:"STT"},
      {text:"Tên",predicate:"name",sortable:true},
      {text:"Email",predicate:"email",sortable:false},
      {text:"Hành động"}
    ];
}]);
app.controller('studentEditCtrl', ['$scope', '$uibModalInstance', 'item', 'Data',
  function ($scope, $uibModalInstance, item, Data){
  $scope.students = angular.copy(item);
 $scope.cancel = function() {
    $uibModalInstance.dismiss('Close');
  }

  $scope.title = 'Chỉnh sửa sinh viên';
  $scope.buttonText = 'Cập nhật';
  var original = item;
  $scope.isClean = function(){
    return angular.equals(original, $scope.students);
  }

  $scope.saveStudent = function(students) {
    Data.put('students/'+students.id, $scope.students).then(function (result){
      if (result.status != 'error'){
        var x = angular.copy(students);
        x.save = 'update';
        $uibModalInstance.close(x);
      }else{
        console.log(result);
      }
    });
  }
}]);
app.controller('studentNewCtrl', ['$scope', '$uibModalInstance', '$http', 'Data',
  function($scope, $uibModalInstance, $http, Data){
   Data.get('getById/'+ sessionStorage.id ).then(function(result){
    $scope.currentUser = result[0];
  });
  $scope.cancel = function() {
    $uibModalInstance.dismiss('Close');
  }
  $scope.title = 'Tạo mới sinh viên';
  $scope.buttonText = 'Thêm sinh viên';
  $scope.addNewStudent = function(students) {
    students.user_id = $scope.currentUser.id;
    Data.post('students', students).then(function (result) {
      if(result.status != 'error'){
          var x = angular.copy(students);
          x.save = 'insert';
          x.id = result.data;
          $uibModalInstance.close(x);
      }else{
        console.log(result);
      }
    });
  }
}]);

