'use strict';

angular.module('cancellerApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
    $routeProvider
      .when('/play', {
        templateUrl: 'views/search.html',
        controller: 'MainCtrl'
      })
    $routeProvider
      .when('/view', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
    $routeProvider.otherwise({
        redirectTo: '/'
      });
  });
