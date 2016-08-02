
var mongoose = require('mongoose');

// create an alarm model
var AlarmSchema = new mongoose.Schema({
  type: String,
  time: String,
  state: String,
  deviceid: String,
  tweet_url: String,
  tweet_id: String,
});


module.exports = mongoose.model('Alarm', AlarmSchema);
