//execute commands
var mongoose = require('mongoose');
var Agent = require('../db/models/agent.js');
var Alarm = require('../db/models/alarm.js');
var mqtt_ctl = require('../mqtt-ctl.js')
var twitter = require('../twitter.js')
var utils = require('../utils.js')

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
  Agent.findOne({'deviceid': deviceid}, function(err, agent) {
    Alarm.count({deviceid: deviceid, state: "active"}, function(err, c) {
      agt = agent.toObject()
      if (!err) {
        agt["alarm_count"] = c
      } else {
        agt["alarm_count"] = -1
      }
      res.send(agt)
    })
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
  alarm = Alarm.findOne({'_id': id}, function(err, alarm) {
    var control_message = {};
    if (alarm) {
      if (alarm["tweet_id"]) {
        twitter.delete_tweet(alarm["tweet_id"])
      }
      Alarm.remove({'_id': id}, function(err) {
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
  var db_message = {};
  console.log(req.body)
  control_message["deviceid"] = req.params.id;
  if (req.body["reboot"]) {
    db_message = {
      rebooted: req.body["reboot"],
      state: "offline"
    }
    control_message["reboot"] = req.body["reboot"]
  } else if ("alarm_on" in req.body){
    db_message = {
      alarm_on: req.body["alarm_on"],
    };
    control_message["alarm_on"] = req.body["alarm_on"];
  } else if ("speech" in req.body) {
    control_message["speech"] = req.body["speech"]
  } else {
    control_message["dryrun"] = req.body["dryrun"]
  }
  mqtt_ctl.control_agent(JSON.stringify(control_message))
  console.log(JSON.stringify(control_message));
  Agent.update({deviceid: req.params.id}, db_message, function(err) {
      if(!err) {
        res.send('{"status": "ok"}')
      }
    }
  )
};

exports.updateAlarm = function (req, res) {
  console.log('Updating alarm');
  Alarm.update({_id: req.params.id}, {
    state: req.body["state"],
  }, function(err) {
      if(!err) {
        res.send('{"status": "ok"}')
      }
  }
  )
};
