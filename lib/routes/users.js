var dbsql = require('../../dbsql'),
  crypto = require('crypto');

  exports.create = function(req, res) {
    var params = req.body;

    params.password = crypto.createHash('md5').update(params.password).digest('hex');

    dbsql.mysql.getConnection(function(err, connection) {
      var valuesUser = {
        name: params.name,
        street: params.street,
        zipcode: params.zipcode,
        city: params.city,
        email: params.email,
        nif: params.nif,
        contact: params.contact,
        username: params.username,
        password: params.password,
      };
      connection.query('INSERT INTO tbl_user SET ?', valuesUser, function(error, results, fields) {
        connection.release();
        if (error) {
          return res.status(500).json({ 'result': 'nok', 'message': error });
        }
        res.status(200).json({ 'result': 'ok' });
    });
    });
  };

exports.list = function(req, res) {
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('SELECT ut.idUser,ut.username,ut.name,ut.street,ut.zipcode,ut.city,ut.email,ut.nif,ut.contact,ut.isActive,ro.nameRole FROM tbl_user ut INNER JOIN tbl_role ro ON ut.role = ro.idRole;', function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};

exports.info = function(req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('SELECT * FROM tbl_user where idUser =?', id, function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });

      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Utilizador não Encontrado' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'data': results[0] });
      }
    });
  });
};

exports.update = function(req, res) {
  var params = req.body;
    var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {
    var values = {
      name: params.name,
      street: params.street,
      zipcode: params.zipcode,
      city: params.city,
      email: params.email,
      nif: params.nif,
      contact: params.contact
    };
    connection.query('UPDATE tbl_user SET ? WHERE idUser = ?', [values,id], function(error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok' });
    });
  });
};

exports.listrole = function(req, res) {
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('select * from tbl_role;', function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};

exports.chpass = function(req, res) {
  var params = req.body;
    var id = req.users.numUtilizador;
    params.password = crypto.createHash('md5').update(params.password).digest('hex');
    dbsql.mysql.getConnection(function(err, connection) {
      var oldPassword = params.password;
      params.newPassword= crypto.createHash('md5').update(params.newPassword).digest('hex');
      params.confirmPassword= crypto.createHash('md5').update(params.confirmPassword).digest('hex');
      if (req.users.password == params.password)
      {
        if (req.users.password != params.confirmPassword)
        {
          if (params.newPassword == params.confirmPassword)
          {
            var values = {
              password: params.confirmPassword,
            };
            connection.query('UPDATE tbl_autenticacao SET ? WHERE utilizador = ? AND password = ?', [values,id,oldPassword], function(error, results, fields) {
              connection.release();
              if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
              req.users.password = params.confirmPassword;
              res.status(200).json({ 'result': 'ok' });
            });
          }
          else
          {
             res.json({'result':'error password'});
          }
        }
        else
        {
          res.json({'result':'equal password'});
        }
      }
      else {
         res.json({'result':'password invalid'});
      }
  });
};

exports.login = function(req, res) {
  res.status(200).json({ 'result': 'ok', 'data': req.users });
};
exports.activeUser = function (req, res) {
  var email= req.params.email;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_user u where u.email = ? LIMIT 1', email, function (error, results) {
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error fetching user (DB)' }); }
      else {
        var token = crypto.randomBytes(10).toString('hex');
        connection.query('UPDATE tbl_user SET token = ? WHERE email = ?', [token, results[0].email], function (error) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error saving USER details (DB)' }); }
          else {
            connection.release();
            dbsql.email(dbsql.url + '/user/' + results[0].email + '/active/' + token, results[0].email, 'Clique aqui Para Ativar a sua Conta');
            res.status(200).json({ 'result': 'ok' });
          }
        });
      }
    });
  });
};
exports.activeUserToken = function (req, res) {
  var email = req.params.email;
  var token = req.params.token;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT u.email, u.token FROM tbl_user u WHERE email = ? LIMIT 1', email, function (error, results) {
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error fetching user (DB)' }); }
      else if (token && token.length > 1 && token === results[0].token) {
        delete results[0].token;
          connection.query('UPDATE tbl_user SET isActive = 1 WHERE email = ?', results[0].email,
          function (error) {
            if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error saving USER details (DB)' }); } else {
              connection.release();
              dbsql.email('A sua conta está ativada ', results[0].email, 'A sua conta está ativada');
              res.status(200).json({ 'result': 'ok', 'massage': 'Conta Activada.' });
            }
          });
      }
    });
  });
};

/*
exports.recoverUser = function (req, res) {
  var email = req.params.email;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_user WHERE email = ? LIMIT 1', email, function (error, results) {
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error fetching user (DB)' }); }
      else {
        var token = crypto.randomBytes(10).toString('hex');
        connection.query('UPDATE tbl_user SET token = ? WHERE email = ?', [token, results[0].email], function (error) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error saving USER details (DB)' }); }
          else {
            connection.release();
            dbsql.email(email.urlf + '/user/' + results[0].email + '/recover/' + token, results[0].email, 'Password recovery');
            res.status(200).json({ 'result': 'ok' });
          }
        });
      }
    });
  });
};
exports.recoverUserToken = function (req, res) {
  var username = req.params.user;
  var token = req.params.token;

  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT user.email, user.token FROM user WHERE email = ? LIMIT 1', username, function (error, results) {
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error fetching user (DB)' }); }
      else if (token && token.length > 1 && token === results[0].token) {
        delete results[0].token;
        var password = crypto.randomBytes(5).toString('hex');
        connection.query('UPDATE user SET password = ? WHERE email = ?', [crypto.createHash('md5').update(password).digest('hex'), results[0].email],
          function (error) {
            if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error saving USER details (DB)' }); } else {
              connection.release();
              dbsql.email('New password is: ' + password, results[0].email, 'New password');
              res.status(200).json({ 'result': 'ok', 'massage': 'New password sent to the account\'s email address.' });
            }
          });
      }
    });
  });
};*/
