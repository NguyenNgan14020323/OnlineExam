// app.controller('categoryCtrl', ['$scope', '$filter', '$modal', 'Data',
//   function ($scope,  $filter,$modal, Data) {
app.controller('categoryCtrl', function($scope, $filter, $modal, Data){
  $scope.category = {};

  Data.get('categories').then(function(data){
    $scope.categories = data;
    $scope.viewby = 5;
    $scope.totalItems = $scope.categories.length;
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


  $scope.edit = function (p,size) {
    var modalInstance = $modal.open({
      templateUrl: 'html/categories/categoryEdit.html',
      controller: 'categoryEditCtrl',
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

  $scope.open = function(p, size){
    console.log("i stayed here...")
    var modalInstance = $modal.open({
      templateUrl: 'html/categories/categoryNew.html',
      controller: 'categoryNewCtrl',
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

  $scope.deleteCategory = function(category){
    if(confirm("Are you sure!!!!")){
      Data.delete('categories/'+category.id).then(function(result){
        $scope.categories = _.without($scope.categories, _.findWhere($scope.categories, {id:category.id}));
      });
    }
  };

  $scope.columns = [
    {text:"ID",predicate:"id",sortable:true},
    {text:"Name",predicate:"name",sortable:true},
    {text:"Descriptions",predicate:"descriptions",sortable:true},
    {text:"Action",predicate:"",sortable:false},
  ];
});

app.controller('categoryEditCtrl', ['$scope', '$modalInstance', 'item', 'Data','$window',
  function ($scope, $modalInstance, item, Data,$window){
  $scope.category = angular.copy(item);
  $scope.cancel = function() {
    $modalInstance.dismiss('Close');
  }

  $scope.title = 'Edit Category';
  $scope.buttonText = 'Update Category';
  var original = item;
  $scope.isClean = function(){
    return angular.equals(original, $scope.category);
  }

  $scope.saveCategory = function(category) {
    Data.put('categories/'+category.id, $scope.category).then(function (result){
      if (result.status != 'error'){
        var x = angular.copy(category);
        x.save = 'update';
        $modalInstance.close(x);
         var host = $window.location.host;
        var landingUrl = "http://" + host + "/#/categories";
        console.log(landingUrl);
        $window.location.href = landingUrl;
          console.log(result);
      }else{
        console.log(result);
      }
    });
  }
}]);

app.controller('categoryNewCtrl', ['$scope', '$modalInstance', '$http', 'Data', '$window',
  function($scope, $modalInstance, $http, Data,$window){
  $scope.cancel = function() {
    $modalInstance.dismiss('Close');
  }
  $scope.title = 'New Category';
  $scope.buttonText = 'Add Category';
  $scope.addNewCategory = function(category) {
    Data.post('categories', category).then(function (result) {
      if(result.status != 'error'){
          var x = angular.copy(category);
          x.save = 'insert';
          x.id = result.data;
          $modalInstance.close(x);
        var host = $window.location.host;
        var landingUrl = "http://" + host + "/#/categories";
        $window.location.href = landingUrl;
      }else{
        console.log(result);
      }
    });
  }
}]);
