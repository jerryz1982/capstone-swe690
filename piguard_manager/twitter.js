var Twit = require('twit')
var ReadJson = require("r-json");
const CREDENTIALS = ReadJson("./client_secret_twitter.json");
consumer_key = process.env.tclient_ck || CREDENTIALS.client.consumerkey
consumer_secret = process.env.tclient_cs || CREDENTIALS.client.consumersecret
access_key = process.env.tclient_ak || CREDENTIALS.client.accesskey
access_secret = process.env.tclient_as || CREDENTIALS.client.accesssecret

var twitter = new Twit({
  consumer_key:         consumer_key,
  consumer_secret:      consumer_secret,
  access_token:         access_key,
  access_token_secret:  access_secret,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

module.exports = {
  delete_tweet: function(statusid) {
    twitter.post('statuses/destroy/:id', { id: statusid }, function (err, data, response) {
      console.log('deleted tweet', statusid)
    })
  }
}
