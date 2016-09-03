
var mongoose = require('mongoose');

// create a user model
var AgentSchema = new mongoose.Schema({
  deviceid: String,
  mac: String,
  ip: String,
  update_time: {type: Date, default: Date.now},
  state: String,
  alarm_on: Boolean,
  rebooted: Boolean,
});


module.exports = mongoose.model('Agent', AgentSchema);
