'use strict';

var app = angular.module('cancellerApp')

app.controller('LoginCtrl', function ($scope, $location, $window) {
    var locationPlay = function() {
      $location.path('/play');
    };
    console.log($location);
  	$scope.auth = function() {
  		R.authenticate(function(){
        console.log('authenticate')
  		}, locationPlay());
  	};
});

app.controller('MainCtrl', function ($scope) {
  	$scope.searchVal;
  	$scope.$watch('searchVal', function(){
  		$scope.search();
  	})
  	$scope.search = function(){
  		R.request({
  			method: "search",
  			content: {
  				query: $scope.searchVal,
  				types: "Album"
  			},
  			success: function(response){
  				$scope.showRes(response.result.results);
  			},
  			error: function(err){
  				console.log('error', err);
  			}
  		})
  	};
  	$scope.showRes = function(albums){
  		$("#albumContainer").empty();
  		_.each(albums, function(album){
  			$scope.albumKey = album.key;
  			$("#albumContainer").append('<button><img alb src="' + album.icon + '" ng-click="play('+ album.key +')"/></button>');
  		});
  	}
  	$scope.play = function(albumKey){
  		R.player.play({ source: $scope.albumKey })
  	}
  	$scope.pause = function(){
  		R.player.togglePause();
  	}
   	$scope.next = function(){
  		R.player.next();
  	}
   	$scope.previous = function(){
  		R.player.previous();
  	}
  });