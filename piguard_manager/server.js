/**
 * Module dependencies.
 */
//var mongoose = require('mongoose');
//require('newrelic');
var express = require('express'),
    api = require('./routes/api');
var mqtt_ctl = require('./mqtt-ctl.js')
var mongoose = require('./db/connect.js')
var app = express();
var bodyParser = require('body-parser')
var spawn = require('child_process').spawn;
var port = process.env.PORT || 8000;

var passport = require('passport');
var twitterAuth = require('./authenticate.js');
var session = require('express-session');

//set gui root dir
app.use(express.static(__dirname + '/gui/static/images'));
app.use(new session({ secret: 'my_precious' }));
app.use(passport.initialize());
app.use(passport.session());

// serialize and deserialize
passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user._id);
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user)
});

// set the home page route
app.get('/', function(req, res) {
  if (req.isAuthenticated()) {
      app.use(express.static(__dirname + '/gui'));
      res.sendFile('/index.html', {root: __dirname + '/gui'});
  } else {
      res.redirect('/login')
  }
});

//mongoose.connect('mongodb://rpi:swe690@ds015924.mlab.com:15924/piguard');
mongoose.init()

// Configuration

// ## CORS middleware
// 
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);
app.use(bodyParser.json());

// JSON API
app.get('/api/agents', ensureAuthenticated, api.agents);
app.get('/api/agents/:id', ensureAuthenticated, api.agent);
app.delete('/api/agents/:id', ensureAuthenticated, api.deleteAgent);
app.put('/api/agents/:id', ensureAuthenticated, api.updateAgent);

app.get('/api/alarms', ensureAuthenticated, api.alarms);
app.get('/api/alarms/:id', ensureAuthenticated, api.alarm);
app.delete('/api/alarms/:id', ensureAuthenticated, api.deleteAlarm);
app.put('/api/alarms/:id', ensureAuthenticated, api.updateAlarm);

app.get('/login', function(req, res){
  app.use(express.static(__dirname + '/gui'));
  res.sendFile('/login.html', {root: __dirname + '/gui'});
});

app.get('/logout', function(req, res){
  req.logout();
  app.use(express.static(__dirname + '/gui'));
  res.sendFile('/login.html', {root: __dirname + '/gui'});
});

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    return next(); }
  res.status(403);
  res.send('Forbidden to unauthorized users');
}

// Start mqtt controller
mqtt_ctl.init();
// Start agent watcher
agent_watcher_path = __dirname + '/agent_watcher.js'
watcher = spawn('node', [agent_watcher_path], { stdio: 'inherit' })


// Start server
app.listen(port, function() {
  console.log("Server running at http://127.0.0.1:" + port);
});
