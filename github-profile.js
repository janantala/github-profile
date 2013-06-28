
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
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

app.get('/', routes.index);

app.get('/analytics/:user', analytics.analyze);
app.post('/upload', uploads.csv);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

/**
 * CRON JOB
 */

var clenup = require('cron').CronJob;
new clenup('0 0 */1 * * *', function(){
	uploads.clear();
}, null, true, "Europe/Bratislava");