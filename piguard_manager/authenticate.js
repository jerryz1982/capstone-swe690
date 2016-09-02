var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var ReadJson = require("r-json");
const CREDENTIALS = ReadJson("./client_secret_twitter.json");

consumer_key = process.env.twitter_ck || CREDENTIALS.web.consumerkey
consumer_secret = process.env.twitter_cs || CREDENTIALS.web.consumersecret
cb_url = process.env.twitter_cburl || CREDENTIALS.web.callbackurl

passport.use(new TwitterStrategy({
    consumerKey: consumer_key,
    consumerSecret: consumer_secret,
    callbackURL: cb_url
  },
  function(request, tokenSecret, profile, done) {
    if (profile.username !== "xyzjerry") {
      err = "Unauthorized"
      console.log(err)
      return done(err, null) }
    else {
      console.log("user authenticated")
      return done(null, profile)
    }
    }
  )
);
