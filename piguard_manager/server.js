/**
 * Module dependencies.
 */
//var mongoose = require('mongoose');
var express = require('express'),
    api = require('./routes/api');
var mqtt_ctl = require('./mqtt-ctl.js')
var mongoose = require('./db/connect.js')
var app = express();
var bodyParser = require('body-parser')
var port = process.env.PORT || 8000;

//set gui root dir
app.use(express.static(__dirname + '/gui'));

// set the home page route
app.get('/', function(req, res) {

    res.render('index');
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
app.get('/api/agents', api.agents);
app.get('/api/agents/:id', api.agent);
app.delete('/api/agents/:id', api.deleteAgent);
app.put('/api/agents/:id', api.updateAgent);

app.get('/api/alarms', api.alarms);
app.get('/api/alarms/:id', api.alarm);
app.delete('/api/alarms/:id', api.deleteAlarm);
app.put('/api/alarms/:id', api.updateAlarm);

// Start mqtt controller
mqtt_ctl.init();

// Start server
app.listen(port, function() {
  console.log("Server running at http://127.0.0.1:" + port);
});
