'use strict';

angular.module('cancellerApp')
  .controller('MainCtrl', function ($scope) {
  	$scope.getPlaybackToken = function() {
  		alert('ehllo');
  	}
  	$http.post('http://api.rdio.com/1/?method=getPlayBackToken')
	  var flashvars = {
		'playbackToken': 'ehhh',
		'domain': 'localhost',               
		'listener': 'callback_object'    // the global name of the object that will receive callbacks from the SWF
		};
  var params = {
    'allowScriptAccess': 'always'
  };
  var attributes = {};
  swfobject.embedSWF('http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
      'apiswf', // the ID of the element that will be replaced with the SWF
      1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);

  });
