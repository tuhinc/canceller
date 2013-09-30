'use strict';

var app = angular.module('cancellerApp')

app.controller('LoginCtrl', function ($scope, $location, $window) {
    var locationPlay = function() {
      $location.path('/play');
    };
  	$scope.auth = function() {
  		R.authenticate(function(){
        console.log('authenticate')
  		}, locationPlay());
  	};
});

app.controller('MainCtrl', function ($scope, $location) {
    $scope.playing = false;
    $scope.hide = function(){
      console.log('hide', $scope.playing)
    };
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
  		_.throttle(_.each(albums, function(album){
  			$scope.albumKey = album.key;
  			$("#albumContainer").append('<button><img class="alb" id="'+ album.key +'" ng-click="play('+ album.key +')" src="' + album.icon + '"/></button>');
      }), 5000);
      $( ".alb" ).on("click", function(e) {
        $scope.play(e.currentTarget.id);
      });
    };
    $scope.play = function(albumKey){
      $scope.playing = !$scope.playing;
      if (albumKey){
        $scope.albumKey = albumKey;
      }
  		// R.player.play({ source: $scope.albumKey });
      $location.path('/view');
  	};
  	$scope.pause = function(){
      $scope.playing = !$scope.playing;
  		R.player.togglePause();
  	};
   	$scope.next = function(){
  		R.player.next();
  	};
   	$scope.previous = function(){
  		R.player.previous();
  	};
  });