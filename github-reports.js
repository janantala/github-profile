
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var ltld = require('local-tld-update');

var app = express();

// all environments
app.set('port', process.env.PORT || 0);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({
  uploadDir: __dirname + '/uploads',
  keepExtensions: true
}));
app.use(express.limit('1mb'));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * HTTP SERVER AND ROUTES
 */

var routes = require('./routes');
var uploads = require('./routes/uploads');
var analytics = require('./routes/analytics');

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
});

app.get('/', routes.index);

app.get('/analytics', analytics.analyze);
app.get('/analytics/:user', analytics.analyze);
app.post('/report', uploads.csv);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + server.address().port);
  ltld.update("github-reports", server.address().port);
});

/**
 * CRON JOB
 */

var clenup = require('cron').CronJob;
new clenup('0 0 */1 * * *', function(){
	uploads.clear();
}, null, true, "Europe/Bratislava");
