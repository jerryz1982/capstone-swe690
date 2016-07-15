/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var express = require('express'),
    api = require('./routes/api');
var mqtt_ctl = require('./mqtt-ctl.js')
var app = express();

mongoose.connect('mongodb://rpi:swe690@ds015924.mlab.com:15924/piguard');
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

// JSON API
app.get('/agents', api.agents);
app.get('/agents/:id', api.agent);
app.delete('/agents/:id', api.deleteAgent);
app.put('/agents/:id', api.updateAgent);

// Start mqtt controller
mqtt_ctl.init();

// Start server
app.listen(8000);
console.log("Server running at http://127.0.0.1:8000/");
