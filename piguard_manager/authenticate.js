var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var ReadJson = require("r-json");
const CREDENTIALS = ReadJson("./client_secret_twitter.json");


passport.use(new TwitterStrategy({
    consumerKey: CREDENTIALS.web.consumerkey,
    consumerSecret: CREDENTIALS.web.consumersecret,
    callbackURL: CREDENTIALS.web.callbackurl
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
