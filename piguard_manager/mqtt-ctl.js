var mqtt = require('mqtt');
var Agent = require('./db/models/agent.js');
var Alarm = require('./db/models/alarm.js');
var utils = require('./utils.js')
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

var configfile = {"message": "hello world!"}
module.exports = { init: function() {

controller.on('connect', function () {  
  controller.subscribe(mqtt_topic_data, { qos: 1 });
  controller.subscribe(mqtt_topic_register, { qos: 1 });
});

controller.on('error', function(err) {
  console.log('mqtt error occurred: ' + err)
});

controller.on('message', function (topic, message) {
  messageStr = message.toString()
  console.log('received message ',  messageStr, topic);
  message = JSON.parse(messageStr)

  if (topic=="RPi/Register") {
    console.log('registering agent in db', message.MacAddr)
    deviceId = message.DeviceId
    deviceMac = message.MacAddr
    deviceIP = message.IPAddr
    utils.update_agent(deviceId, deviceMac, deviceIP, Date.now())
  }

  if (topic=="RPi/Data") {
    console.log('saving alarm', message)
    newalarm = new Alarm ({
      tweet_id: message.Tweet_id,
      tweet_url: message.Tweet_url,
      type: message.Type,
      time: message.Timestamp,
      deviceid: message.DeviceId,
      state: "active"
    }, function(err) {
        if (err) {
          console.log('error creating alarm')
        } else {
          console.log('alarm created')
        }
      } 
    );
    newalarm.save()
  }

});

},

  control_agent: function(message) {
    controller.publish(mqtt_topic_control, message)
  },

}
