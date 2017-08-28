var server = require('./server');
var dbsql = require('./dbsql.js');
dbsql.mysql.getConnection(function(err){
  if(!err) {
    console.log("Database is connected ... nn");
    server.start();
  } else {
    console.log("Error connecting database ... nn");
  }
});
