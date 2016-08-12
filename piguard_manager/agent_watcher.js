var Agent = require('./db/models/agent.js');
var utils = require('./utils.js')
var mongoose = require('./db/connect.js')

function watch_agent() {
   Agent.find({}, function(err, agents) {
        if(err) {
          console.log('error is encountered', err)
        } else {
        console.log('periodically updating agent')
        agents.forEach(function(agent) {
          utils.update_agent(agent.deviceid)
        }) }
    });
}

mongoose.init()
//setInterval(function(){ console.log("Hello"); }, 3000);
setInterval(watch_agent, 60000)
