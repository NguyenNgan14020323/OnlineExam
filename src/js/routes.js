'use strict';

/**
 * Route configuration for the RDash module.
 */
angular.module('RDash').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'templates/dashboard.html'
            })
            .state('tables', {
                url: '/tables',
                templateUrl: 'templates/tables.html'
            })
            .state('questions', {
                url: '/questions',
                controller: 'questionCtrl',
                templateUrl: 'templates/questions/question.html'
            })
            .state('students', {
                url: '/students',
                controller: 'studentCtrl',
                templateUrl: 'templates/students/student.html'
            })
            .state('edit', {
                url: '/questions/edit/:id',
                controller: 'editQuestionCtrl',
                templateUrl: 'templates/questions/questionEdit.html'
            })
            .state('add', {
              url: '/questions/add',
              controller: 'addQuestionCtrl',
              templateUrl: 'templates/questions/questionNew.html'
            })
            .state('categories', {
              url: '/categories',
              controller: 'categoryCtrl',
              templateUrl: 'templates/categories/category.html'
            })
            .state('examies', {
              url: '/examies',
              controller: 'examCtrl',
              templateUrl: 'templates/examies/exam.html'
            })
            .state('section', {
              url: '/examies/:id/sections',
              controller: 'sectionCtrl',
              templateUrl: 'templates/sections/section.html'
            })
            .state('section question', {
              url: '/section_questions',
              controller: 'section_questionCtrl'
            })
            .state('details', {
              url: '/examies/:id/details',
              controller: 'detailExamCtrl',
              templateUrl: 'templates/examies/detail.html'
            })
            .state('exam',{
              url:'/examies/:exam_name/id/:id',
              controller: 'examTestCtrl',
              templateUrl: 'templates/examies/index.html'
            })
            .state('Question in Category', {
              url: '/categories/:id/questions',
              controller: 'section_questionCtrl'
            })
            .state('signup', {
              url: '/signup',
              controller: 'signupCtrl',
              templateUrl: 'templates/user/signup.html'
            })
            .state('login', {
              url: '/login',
              controller: 'loginCtrl',
              templateUrl: 'templates/user/login.html'
            })
            .state('changePass', {
              url: '/changePass',
              controller: 'changePassCtrl',
              templateUrl: 'templates/user/changePass.html'
            })
            .state('profile', {
              url: '/profile',
              controller: 'profileCtrl',
              templateUrl: 'templates/user/profile.html'
            })
            ;
    }
]);
