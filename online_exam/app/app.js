var app = angular.module('myApp', ['ngRoute',
 'ui.bootstrap',
  'ngAnimate',
  'ngTable',
  'cloudinary',
  'photoAlbumAnimations',
  'photoAlbumControllers',
  'photoAlbumServices',
  ]);
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/home', {
      title: 'List questions',
      templateUrl: 'html/questions/question.html',
      controller: 'questionCtrl',
    })
    .when('/question/add', {
      title: 'Add questions',
      templateUrl: 'html/questions/questionNew.html',
      controller: 'addQuestionCtrl',
    })
    .when('/question/edit/:id', {
      title: ' Edit questions',
      templateUrl: 'html/questions/questionEdit.html',
      controller: 'editQuestionCtrl',
    })
    .when('/categories', {
      title: "List Category",
      templateUrl: 'html/categories/category.html',
      controller: 'categoryCtrl',
    })
    .when('/examies',{
      title: "Exam",
      templateUrl: 'html/examies/exam.html',
      controller: 'examCtrl',
    })
    .when('/examies/:id/sections',{
      title: "Exam",
      templateUrl: 'html/sections/section.html',
      controller: 'sectionCtrl',
    })
    .when('/examies/:id/show',{
      title: "Exam",
      templateUrl: 'html/examies/detail.html',
      controller: 'detailExamCtrl',
    })
    .when('/section_questions', {
      title: "Question in Section",
      controller: 'section_questionCtrl',
    }).
    when('/categories/:id/questions', {
      title: "Question in Category",
      controller: 'section_questionCtrl',
    })
    .otherwise({
      redirectTo: '/home'
    });
}]);
