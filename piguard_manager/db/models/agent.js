
var mongoose = require('mongoose');

// create a user model
var AgentSchema = new mongoose.Schema({
  deviceid: String,
  mac: String,
  ip: String,
  update_time: {type: Date, default: Date.now},
  alarm_on: Boolean,
});


module.exports = mongoose.model('Agent', AgentSchema);
