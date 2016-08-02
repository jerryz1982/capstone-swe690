var mongoose = require('mongoose');
var db = mongoose.connection;
var dbURI = 'mongodb://rpi:swe690@ds015924.mlab.com:15924/piguard'
var options = {
                server:{auto_reconnect:true,
                        socketOptions: { socketTimeoutMS: 30000, keepAlive: 30000, connectTimeoutMS: 30000 }
                       }
              }
module.exports = { init: function() {

  db.on('connecting', function() {
    console.log('connecting to MongoDB...');
  });

  db.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
  });
  db.on('connected', function() {
    console.log('MongoDB connected!');
  });
  db.once('open', function() {
    console.log('MongoDB connection opened!');
  });
  db.on('reconnected', function () {
    console.log('MongoDB reconnected!');
  });
  db.on('disconnected', function() {
    console.log('MongoDB disconnected!');
    mongoose.connect(dbURI, options);
  });
  mongoose.connect(dbURI, options);

  }
}
