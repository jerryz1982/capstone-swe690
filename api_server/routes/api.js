//execute commands
var mongoose = require('mongoose');
var Agent = require('../db/models/agent.js');
var mqtt_ctl = require('../mqtt-ctl.js')
// GET
exports.agents = function (req, res) {
  console.log('Getting agents.');
  Agent.find({}, function(err, agents) {
    res.send(agents)
  }); 
};

exports.agent = function (req, res) {
  var deviceid = req.params.id;
  Agent.find({'deviceid': deviceid}, function(err, agent) {
    res.send(agent)
  });
};

// DELETE
exports.deleteAgent = function (req, res) {
  var deviceid = req.params.id;
  Agent.remove({'deviceid': deviceid}, function(err) {
    if (!err) {
      res.redirect('/agents')
    }
  });
};

// UPDATE
exports.updateAgent = function (req, res) {
  var control_message = {};
  control_message["deviceid"] = req.params.id;
  control_message["alarm_on"] = req.body["alarm_on"];
  control_message["reboot"] = req.params["reboot"];
  mqtt_ctl.control_agent(JSON.stringify(control_message))
  Agent.update({deviceid: req.params.id}, {
    alarm_on: req.params.alarm_on,
  }, function(err) {
      if(!err) {
        res.redirect('/agents/' + req.params.id)
      }
    }
  )
};
