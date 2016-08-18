var Agent = require('./db/models/agent.js');

module.exports = { update_agent:
 function (deviceId, deviceMac, deviceIP, updateTime) {
   Agent.findOne({deviceid: deviceId}, null, function (err, agent) {
      if( agent == null ) {
        console.log('creating new agent');
        newagent = new Agent( {
          deviceid: deviceId,
          mac: deviceMac,
          ip: deviceIP,
          update_time: updateTime,
          state: "online",
        } )
        newagent.save()
        //controller.publish(mqtt_topic_config, JSON.stringify(configfile))
      }
      else {
        console.log('updating agent', agent.mac)
        devicemac = deviceMac || agent.mac;
        deviceip = deviceIP || agent.ip;
        if(updateTime == null ) {
          newtime = Date.now()
          last_update = agent.update_time.getTime()
          update_time = last_update
          diff = newtime - last_update
          if( diff > 120000 ) {
            state = "offline"
          } else {
            state = "online"
          }
        } else {
          update_time = updateTime
          state = "online"
        }
        Agent.update({deviceid: deviceId}, {
          $set: { mac: devicemac, update_time: update_time,
            ip:deviceip, state: state }}, function (err, agent) {
          console.log('updated', agent)
        });
      }
    });
}

}
