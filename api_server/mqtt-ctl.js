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
var url  = 'mqtt://' + mqtt_host + ':' + mqtt_port;

var client = mqtt.connect(url, { username: mqtt_vhost + ":" + mqtt_user, password: mqtt_pass, clientId: 'mqtt-ctl', clean: false });

mongoose.connect('mongodb://rpi:swe690@ds015924.mlab.com:15924/piguard');

client.on('connect', function () {  
  client.subscribe(mqtt_topic_data, { qos: 1 });
  client.subscribe(mqtt_topic_register, { qos: 1 });
});

client.on('message', function (topic, message) {
  messageStr = message.toString()
  console.log('received message ',  messageStr, topic);
  if (topic=="RPi/Register") {
    message = JSON.parse(messageStr)
    console.log('registering agent in db', message.MacAddr)
    Agent.findOne({deviceid: message.DeviceId}, null, function (err, agent) {
      if( agent == null ) {
        console.log('creating new agent');
        newagent = new Agent( {
          deviceid: message.DeviceId,
          mac: message.MacAddr,
        } )
        newagent.save()
      }
      else {
        console.log('updating agent');
        Agent.update({deviceid: message.DeviceId}, { $set: { mac: message.MacAddr, update_time: Date.now() }}, function (err, agent) {
          console.log('updated', agent)
        });
    }
  });
  }
});
