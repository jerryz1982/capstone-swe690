
var mongoose = require('mongoose');

// create an alarm model
var AlarmSchema = new mongoose.Schema({
  id: String,
  type: String,
  time: {type: Date, default: Date.now},
  state: String,
  deviceid: String,
  tweet_url: String,
  tweet_id: String,
});


module.exports = mongoose.model('Alarm', AlarmSchema);
