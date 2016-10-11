var mqtt = require('mqtt');
var Agent = require('./db/models/agent.js');
var Alarm = require('./db/models/alarm.js');
var utils = require('./utils.js')
var mqtt_host1 = 'hyena.rmq.cloudamqp.com' 
var mqtt_port = '1883'
var mqtt_host2 = 'black-boar.rmq.cloudamqp.com'
var mqtt_user1 = 'dfwxdeyo'
var mqtt_pass1 = 'GTFbKpT7scn2nXgrWrtzfRLaniD0wfMr'
var mqtt_vhost1 = 'dfwxdeyo'
var mqtt_user2 = 'wdaqzwhm'
var mqtt_pass2 = 'WYfU_5mMfYUqbJ2BHsRt3yYn_GXR0pGN'
var mqtt_vhost2 = 'wdaqzwhm'
var mqtt_topic_data = 'RPi.Data'
var mqtt_topic_control = 'RPi.Control'
var mqtt_topic_register = 'RPi.Register'
var mqtt_topic_config = 'RPi.Config'
var mqtt_url1  = 'mqtt://' + mqtt_host1 + ':' + mqtt_port;
var mqtt_url2  = 'mqtt://' + mqtt_host2 + ':' + mqtt_port;
var controller1 = mqtt.connect(mqtt_url1, { username: mqtt_vhost1 + ":" + mqtt_user1, password: mqtt_pass1, clientId: 'mqtt-ctl', clean: true });
var controller2 = mqtt.connect(mqtt_url2, { username: mqtt_vhost2 + ":" + mqtt_user2, password: mqtt_pass2, clientId: 'mqtt-ctl', clean: true });
var controllers = [controller1, controller2]

var config = {}

var twitter_handles = [ "xyzjerry" ]

module.exports = { init: function() {

controllers.forEach( function(controller) {
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
    utils.find_agent(deviceId, function(agent) {
      if(agent != null) {
        config["deviceid"] = deviceId
        config["alarm_on"] = agent.alarm_on
        config["twitter_handles"] = twitter_handles
        console.log("sending config for agent")
        controller.publish(mqtt_topic_config, JSON.stringify(config))
      }
    })
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
});
},

  control_agent: function(message) {
    controllers.forEach( function(controller) {
      controller.publish(mqtt_topic_control, message, {qos: 1, retain: true})
      console.log('sent control message', message)
    });
  },

}
