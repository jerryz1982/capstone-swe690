//execute commands
var mongoose = require('mongoose');
var Agent = require('../db/models/agent.js');
var Alarm = require('../db/models/alarm.js');
var mqtt_ctl = require('../mqtt-ctl.js')
// GET
exports.agents = function (req, res) {
  console.log('Getting agents.');
  Agent.find({}, function(err, agents) {
    res.send(agents)
  }); 
};


exports.alarms = function (req, res) {
  console.log('Getting alarms.');
  if (req.query.deviceid) {
    Alarm.find({'deviceid': req.query.deviceid}, function(err, alarms) {
      res.send(alarms)
    });
  } else {
    Alarm.find({}, function(err, alarms) {
      res.send(alarms)
    });
  }
};

exports.agent = function (req, res) {
  var deviceid = req.params.id;
  Agent.find({'deviceid': deviceid}, function(err, agent) {
    res.send(agent)
  });
};

exports.alarm = function (req, res) {
  var id = req.params.id;
  Alarm.find({'tweet_id': id}, function(err, alarm) {
    res.send(alarm)
  });
};

// DELETE
exports.deleteAgent = function (req, res) {
  var deviceid = req.params.id;
  Agent.remove({'deviceid': deviceid}, function(err) {
    if (!err) {
      res.send('{"status": "ok"}')
    }
  });
};

exports.deleteAlarm = function (req, res) {
  var id = req.params.id;
  alarm = Alarm.find({'tweet_id': id}, function(err, alarm) {
    var control_message = {};
    if (alarm.length == 1) {
      control_message["deviceid"] = alarm[0]["deviceid"];
      control_message["delete"] = alarm[0]["tweet_id"];
      mqtt_ctl.control_agent(JSON.stringify(control_message))
      Alarm.remove({'tweet_id': id}, function(err) {
        if (!err) {
          res.send('{"status": "ok"}')
        } else {
          console.log('alarm delete failed')
        }
      });
    } else {
      console.log("alarm not found", alarm)
      res.status(404)        // HTTP status 404: NotFound
         .send('Not found');
    }
  });
};

// UPDATE
exports.updateAgent = function (req, res) {
  console.log('Updating agent');
  var control_message = {};
  console.log(req.body)
  control_message["deviceid"] = req.params.id;
  control_message["alarm_on"] = req.body["alarm_on"];
  control_message["reboot"] = req.body["reboot"];
  mqtt_ctl.control_agent(JSON.stringify(control_message))
  console.log(JSON.stringify(control_message));
  Agent.update({deviceid: req.params.id}, {
    alarm_on: req.body["alarm_on"],
  }, function(err) {
      if(!err) {
        res.send('{"status": "ok"}')
      }
    }
  )
};

exports.updateAlarm = function (req, res) {
  console.log('Updating alarm');
  Alarm.update({tweet_id: req.params.id}, {
    state: req.body["state"],
  }, function(err) {
      if(!err) {
        res.send('{"status": "ok"}')
      }
  }
  )
};