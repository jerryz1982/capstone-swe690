var mqtt = require('mqtt');
var mongoose = require('mongoose');
var Agent = require('./db/models/agent.js');
var mqtt_host = 'hyena.rmq.cloudamqp.com' 
var mqtt_port = '1883'
var mqtt_user = 'dfwxdeyo'
var mqtt_pass = 'GTFbKpT7scn2nXgrWrtzfRLaniD0wfMr'
var mqtt_vhost = 'dfwxdeyo'
var mqtt_topic_data = 'RPi.Data'
var mqtt_topic_control = 'RPi.Control'
var mqtt_topic_register = 'RPi.Register'
var mqtt_topic_config = 'RPi.Config'
var url  = 'mqtt://' + mqtt_host + ':' + mqtt_port;

var controller = mqtt.connect(url, { username: mqtt_vhost + ":" + mqtt_user, password: mqtt_pass, clientId: 'mqtt-ctl', clean: true });

var configfile = {"message": "hellow world!"}
//mongoose.connect('mongodb://rpi:swe690@ds015924.mlab.com:15924/piguard');
module.exports = { init: function() {

function update_agent(deviceId, deviceMac, deviceIP) {

   Agent.findOne({deviceid: deviceId}, null, function (err, agent) {
      if( agent == null ) {
        console.log('creating new agent');
        newagent = new Agent( {
          deviceid: deviceId,
          mac: deviceMac,
          ip: deviceIP,
        } )
        newagent.save()
        controller.publish(mqtt_topic_config, JSON.stringify(configfile))
      }
      else {
        console.log('updating agent');
        Agent.update({deviceid: deviceId}, { $set: { mac: deviceMac, update_time: Date.now() }}, function (err, agent) {
          console.log('updated', agent)
        });
      }
    });

}


controller.on('connect', function () {  
  controller.subscribe(mqtt_topic_data, { qos: 1 });
  controller.subscribe(mqtt_topic_register, { qos: 1 });
});

controller.on('message', function (topic, message) {
  messageStr = message.toString()
  console.log('received message ',  messageStr, topic);
  if (topic=="RPi/Register") {
    message = JSON.parse(messageStr)
    console.log('registering agent in db', message.MacAddr)
    deviceId = message.DeviceId
    deviceMac = message.MacAddr
    deviceIP = message.IPAddr
    update_agent(deviceId, deviceMac, deviceIPAddr)
  }
});

}

  control_agent: function(message) {
    controller.publish(mqtt_topic_control, message)
  }

}
