app.controller('section_questionCtrl', ['$scope', '$rootScope', '$uibModalInstance', '$http', 'Data',
  function($scope, $rootScope, $uibModalInstance, $http, Data){
  Data.get('categories').then(function(data){
    $scope.categories = data;
    $scope.category = $scope.categories[1];
    $scope.category_id_init =  $scope.categories[1].id;
    Data.get('categories/'+$scope.category_id_init).then(function(data){
      $scope.questions = data;
      $scope.min = 1;
      $scope.max = $scope.questions.length;
    });
  });

  $scope.list_question_id_choose = [];

  $scope.category_id_in_form;

  function create_ids_section_question(n, m){
    var a = [];
    while(a.length < n) {
      v = Math.floor(Math.random() * m) + 1 ;
      if(a.indexOf(v) < 0){
        a.push(v);
      }
    }
    return a;
  }

  $scope.view_random_question = function(){
    var number = $scope.number_question_random;
    if (number != null){
      var b = [];
      Data.get('categories/'+$scope.category.id).then(function(data){
        $scope.question_in_categories = data;
        b = create_ids_section_question(number, $scope.question_in_categories.length);
        $scope.question_view_in_random = [];
        for(var i = 0; i<b.length; i++){
          var index = b[i] - 1;
          Data.get('questions/'+$scope.question_in_categories[index].id).then(function(data){
            $scope.question_view_in_random.push(data);
          });
        }
        });
    }
  }

  $scope.auto_review = function(){
    $scope.view_random_question();
  }

  $scope.update = function(){
    $scope.category_id_in_form = $scope.category.id;
    Data.get('categories/'+$scope.category.id).then(function(data){
      $scope.questions = data;
      $scope.max = $scope.questions.length;
    });
  }

  function check_id_in_question(a){
    var i, j, count,z;
    var c = [];
    for(i = 0; i < a.length; i++){
      count = 1;
      for(j= i+1; j < a.length; j++){
        if(a[j] == a[i]){
          count++;
        }
      }
      if (count >= 2 &&  count%2 == 0){
        c.push(a[i]);
      }
    }
    for(i = 0;i<c.length;c++){
      for(j=0;j<a.length;j++){
        if(a[j] == c[i]){
          a.splice(j,1);
        }
      }
    }
    return a;
  }

  $scope.list_question_choose = function(question){
    $scope.list_question_id_choose.push(question.id);
  }

  $scope.create_section_question_by_choose_question = function(){
    $scope.list_question_id_choose = check_id_in_question($scope.list_question_id_choose);
    var section_id = $rootScope.id_section;
    for (i = 0; i < $scope.list_question_id_choose.length; i++) {
      var section_question = {
        question_id: $scope.list_question_id_choose[i],
        section_id: section_id,
      };
      Data.post('section_questions', section_question).then(function(result){
        var x = angular.copy(section_question);
        x.id = result.data;
        $uibModalInstance.close(x);
      });
    }
  }

  $scope.list_question_in_category = function(){
    Data.get('categories/'+$scope.category.id).then(function(data){
      $scope.questions = data;
    });
  };

  $scope.push_question_section = function() {
    Data.get('categories/'+$scope.category_id_in_form).then(function(data){
      var section_id = $rootScope.id_section;
      var list_question_in_category = data;
      for (i = 0; i < $scope.question_view_in_random.length; i++) {
        var section_question = {
          question_id: $scope.question_view_in_random[i][0].id,
          section_id: section_id,
        };
        Data.post('section_questions', section_question).then(function(result){
            var x = angular.copy(section_question);
            x.id = result.data;
            $uibModalInstance.close(x);
          });
      }
    });
    // var section_id = $rootScope.id_section;
    // var number = $scope.number_question_random;
    // var section_question = {
    //   question_id : number,
    //   section_id: section_id,
    // }
    // Data.post('section_questions', section_question).then(function(result){
    //   var x = angular.copy(section_question);
    //   x.id = result.data;
    //   $uibModalInstance.close(x);
    // })
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('Close');
  }

  $scope.stateChanged = function(q, checked){
    if(q.id > 0 && checked){
      $scope.list_questions_chooes.push(q.id);
    }
    console.log($scope.list_questions_chooes);
  }
}]);
