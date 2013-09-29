var express = require('express'),
  http = require('http'),
  path = require('path');

var app = express();

// handles CORS
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

var mimeTypes = {
    ".js": "text/javascript",
    ".html": "text/html",
    ".css": "text/css", 
    '.mp3': 'audio/mpeg'
};

app.configure(function() {
  app.use(allowCrossDomain);
  app.use(express.static(path.join(__dirname, './../app' ) ) );
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(app.router);
});

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);
