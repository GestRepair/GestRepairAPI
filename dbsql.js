var mysql = require('mysql'),
  emailjs = require('emailjs');

var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '123qwe',
  database : 'gestrepair'
});

var email = {
  'smtp': 'in-v3.mailjet.com',
  'user': '',
  'password': ''
};

var sendMessage = function(message, destination, subject, from, callback) {
  var connection = emailjs.server.connect({
    user: email.user,
    password: email.password,
    host: email.smtp,
    port: 25
  });

  connection.send({
    text: message,
    'reply-to': from || email.user,
    from: 'barcelos.rui@gmail.com',
    to: destination,
    subject: subject || 'GestRepair'
  }, function(err, message) {
    if (callback) callback(err, message);
  });
};

module.exports = {
  'url' :'http://localhost:8080',
  'urlf' :'http://localhost:4200',
  'mysql': pool,
  'email': sendMessage,
  'photoPath': __dirname + "/photos",
  'defaultPhoto': 'serviceDefphoto.png'
};
