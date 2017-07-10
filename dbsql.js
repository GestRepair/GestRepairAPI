var mysql = require('mysql');

var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '123qwe',
  database : 'gestrepair'
});

module.exports = {
  'mysql': pool
};
